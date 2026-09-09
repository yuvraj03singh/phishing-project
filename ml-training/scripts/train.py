"""
Master Training and Evaluation Pipeline for Phishing URL Detection.
Runs baseline benchmarks, Stratified 5-Fold CV, hybrid ensemble generation,
model selection, evaluation reports, and production artifact export.
"""

import sys
import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.base import clone

# Setup search paths
ML_TRAINING_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = ML_TRAINING_DIR.parent
sys.path.insert(0, str(ML_TRAINING_DIR))
sys.path.insert(0, str(ROOT_DIR))

from configs.config import (
    MODEL_V1_DIR, EXPERIMENTS_DIR, REPORTS_DIR, RANDOM_STATE, CV_FOLDS, RISK_THRESHOLDS
)
from data.dataset_builder import build_and_save_datasets
from features.registry import FeatureRegistry
from preprocessing.pipeline import PhishingPreprocessingPipeline
from models.model_factory import get_baseline_models
from models.hybrid_models import HybridVotingClassifier, HybridStackingClassifier
from evaluation.metrics import compute_metrics
from evaluation.plots import (
    plot_confusion_matrix, plot_roc_curves, plot_model_comparison_chart
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TrainPipeline")


def run_training_pipeline():
    logger.info("=== Starting Production ML Training & Benchmark Pipeline ===")
    start_time = time.time()

    # Step 1: Ingest and split dataset
    logger.info("Step 1: Ingesting dataset and creating stratified splits...")
    train_df, val_df, test_df = build_and_save_datasets()

    # Step 2: Feature Extraction
    logger.info("Step 2: Extracting lexical & structural features via FeatureRegistry...")
    registry = FeatureRegistry()
    feature_names = registry.get_all_feature_names()
    logger.info("Total features registered: %d", len(feature_names))

    X_train_raw = registry.extract_features_df(train_df["url"].tolist())
    y_train = train_df["label"].values

    X_val_raw = registry.extract_features_df(val_df["url"].tolist())
    y_val = val_df["label"].values

    X_test_raw = registry.extract_features_df(test_df["url"].tolist())
    y_test = test_df["label"].values

    # Step 3: Fit Preprocessing strictly on Train features
    logger.info("Step 3: Fitting Preprocessing Pipeline on training features...")
    preprocessor = PhishingPreprocessingPipeline(scaler_type="robust", variance_threshold=0.0)
    X_train = preprocessor.fit_transform(X_train_raw, pd.Series(y_train))
    X_val = preprocessor.transform(X_val_raw)
    X_test = preprocessor.transform(X_test_raw)

    logger.info("Processed feature matrix shape: %s", X_train.shape)

    # Step 4: Baseline Models Benchmark & 5-Fold Cross Validation
    logger.info("Step 4: Running 5-Fold Stratified Cross Validation on Baseline Models...")
    baseline_models = get_baseline_models(random_state=RANDOM_STATE)
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)

    cv_results = {}
    for name, model in baseline_models.items():
        logger.info("  Training & Evaluating: %s ...", name)
        fold_f1s, fold_aucs, fold_recalls = [], [], []

        for train_idx, cv_val_idx in cv.split(X_train, y_train):
            X_tr_fold, y_tr_fold = X_train[train_idx], y_train[train_idx]
            X_cv_val, y_cv_val = X_train[cv_val_idx], y_train[cv_val_idx]

            fold_model = clone(model)
            fold_model.fit(X_tr_fold, y_tr_fold)
            fold_pred = fold_model.predict(X_cv_val)
            fold_proba = fold_model.predict_proba(X_cv_val)

            m = compute_metrics(y_cv_val, fold_pred, fold_proba)
            fold_f1s.append(m["f1"])
            fold_aucs.append(m["roc_auc"])
            fold_recalls.append(m["recall"])

        cv_results[name] = {
            "cv_f1_mean": round(float(np.mean(fold_f1s)), 4),
            "cv_f1_std": round(float(np.std(fold_f1s)), 4),
            "cv_roc_auc_mean": round(float(np.mean(fold_aucs)), 4),
            "cv_recall_mean": round(float(np.mean(fold_recalls)), 4)
        }
        logger.info("    -> CV F1: %.4f (+/- %.4f) | CV AUC: %.4f | CV Recall: %.4f",
                    cv_results[name]["cv_f1_mean"], cv_results[name]["cv_f1_std"],
                    cv_results[name]["cv_roc_auc_mean"], cv_results[name]["cv_recall_mean"])

    # Step 5: Fit all baseline models on full X_train and evaluate on Validation Set
    fitted_models = {}
    for name, model in baseline_models.items():
        m_fit = clone(model)
        m_fit.fit(X_train, y_train)
        fitted_models[name] = m_fit

    # Step 6: Construct Hybrid Ensembles
    logger.info("Step 5: Training Hybrid ML Architectures...")
    # Soft Voting Classifier
    voting_estimators = [
        ("XGBoost", baseline_models["XGBoost"]),
        ("Random Forest", baseline_models["Random Forest"]),
        ("Extra Trees", baseline_models["Extra Trees"]),
        ("LightGBM", baseline_models["LightGBM"]),
        ("Gradient Boosting", baseline_models["Gradient Boosting"])
    ]
    voting_model = HybridVotingClassifier(estimators=voting_estimators, weights=[0.25, 0.20, 0.20, 0.20, 0.15])
    voting_model.fit(X_train, y_train)
    fitted_models["Hybrid (Soft Voting)"] = voting_model

    # Stacking Classifier
    stacking_estimators = [
        ("XGBoost", baseline_models["XGBoost"]),
        ("Random Forest", baseline_models["Random Forest"]),
        ("Extra Trees", baseline_models["Extra Trees"]),
        ("LightGBM", baseline_models["LightGBM"]),
        ("Logistic Regression", baseline_models["Logistic Regression"])
    ]
    stacking_model = HybridStackingClassifier(
        base_estimators=stacking_estimators,
        n_splits=5,
        random_state=RANDOM_STATE
    )
    stacking_model.fit(X_train, y_train)
    fitted_models["Hybrid (Stacking Meta-Learner)"] = stacking_model

    # Step 7: Final Test Set Evaluation
    logger.info("Step 6: Performing untouched Test Set Evaluation...")
    test_eval_records = []
    all_plot_data = {}

    for name, model in fitted_models.items():
        # Measure inference latency
        t0 = time.perf_counter()
        y_test_pred = model.predict(X_test)
        y_test_proba = model.predict_proba(X_test)
        t_elapsed = (time.perf_counter() - t0) * 1000.0
        latency_per_sample = t_elapsed / len(X_test)

        metrics = compute_metrics(y_test, y_test_pred, y_test_proba, latency_ms=latency_per_sample)
        
        record = {
            "model": name,
            **metrics
        }
        if name in cv_results:
            record.update(cv_results[name])
        
        test_eval_records.append(record)
        all_plot_data[name] = {
            "y_true": y_test,
            "y_proba": y_test_proba,
            "metrics": metrics
        }

        # Save individual confusion matrix
        safe_name = name.lower().replace(" ", "_").replace("(", "").replace(")", "")
        cm_path = REPORTS_DIR / f"confusion_matrix_{safe_name}.png"
        plot_confusion_matrix(y_test, y_test_pred, name, cm_path)

    results_df = pd.DataFrame(test_eval_records).sort_values(by=["f1", "recall", "roc_auc"], ascending=False)
    results_csv_path = EXPERIMENTS_DIR / "results.csv"
    results_df.to_csv(results_csv_path, index=False)
    logger.info("Saved benchmark evaluation results to: %s", results_csv_path)

    # Print summary table
    print("\n" + "="*95)
    print("                      FINAL MODEL BENCHMARK EVALUATION ON TEST SET")
    print("="*95)
    print(results_df[["model", "accuracy", "precision", "recall", "f1", "roc_auc", "false_negative_rate", "latency_ms_per_sample"]].to_string(index=False))
    print("="*95 + "\n")

    # Step 8: Generate Benchmark Comparison Visualizations
    logger.info("Step 7: Generating benchmark charts and ROC plots...")
    roc_plot_path = REPORTS_DIR / "roc_curves_comparison.png"
    plot_roc_curves(all_plot_data, roc_plot_path)

    comp_plot_path = REPORTS_DIR / "model_comparison_bar_chart.png"
    plot_model_comparison_chart(results_df, comp_plot_path)
    logger.info("Saved report figures to: %s", REPORTS_DIR)

    # Step 9: Select Champion Model and Export Production Artifacts
    champion_name = results_df.iloc[0]["model"]
    champion_model = fitted_models[champion_name]
    champion_metrics = results_df.iloc[0].to_dict()

    logger.info("Champion Model Selected: %s (F1=%.4f, Recall=%.4f, AUC=%.4f)",
                champion_name, champion_metrics["f1"], champion_metrics["recall"], champion_metrics["roc_auc"])

    # Export artifacts
    joblib.dump(preprocessor, MODEL_V1_DIR / "pipeline.joblib")
    joblib.dump(champion_model, MODEL_V1_DIR / "model.joblib")

    with open(MODEL_V1_DIR / "feature_names.json", "w") as f:
        json.dump(feature_names, f, indent=2)

    with open(MODEL_V1_DIR / "thresholds.json", "w") as f:
        json.dump(RISK_THRESHOLDS, f, indent=2)

    metadata = {
        "model_version": "phishing-hybrid-v1.0.0",
        "model_name": champion_name,
        "training_date": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "dataset": {
            "total_samples": len(train_df) + len(val_df) + len(test_df),
            "train_samples": len(train_df),
            "val_samples": len(val_df),
            "test_samples": len(test_df)
        },
        "feature_count": len(feature_names),
        "selected_features": feature_names,
        "metrics": champion_metrics,
        "risk_thresholds": RISK_THRESHOLDS,
        "pipeline_version": "1.0.0"
    }

    with open(MODEL_V1_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    total_time = round(time.time() - start_time, 2)
    logger.info("Training pipeline complete in %.2f seconds! Artifacts saved to: %s", total_time, MODEL_V1_DIR)
    return metadata


if __name__ == "__main__":
    run_training_pipeline()
