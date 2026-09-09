"""
Evaluation Plotting and Reporting Suite.
Generates research-ready publication visualizations:
Confusion Matrices, ROC curves, PR curves, and Model Comparison Bar Charts.
"""

from pathlib import Path
from typing import Dict, Any, List
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import roc_curve, precision_recall_curve, confusion_matrix, ConfusionMatrixDisplay


def plot_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, model_name: str, save_path: Path):
    """Render and save confusion matrix figure."""
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Legitimate", "Phishing"])
    disp.plot(cmap="Blues", ax=ax, values_format="d")
    ax.set_title(f"Confusion Matrix - {model_name}", fontsize=12, fontweight="bold", pad=12)
    plt.tight_layout()
    fig.savefig(save_path, bbox_inches="tight")
    plt.close(fig)


def plot_roc_curves(results: Dict[str, Dict[str, Any]], save_path: Path):
    """Plot overlaid ROC curves for all candidate models."""
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    ax.plot([0, 1], [0, 1], "k--", label="Random Baseline (AUC = 0.50)")

    for name, data in results.items():
        if "y_true" in data and "y_proba" in data:
            y_true = data["y_true"]
            y_proba = data["y_proba"]
            if y_proba.ndim > 1:
                y_proba = y_proba[:, 1]
            fpr, tpr, _ = roc_curve(y_true, y_proba)
            auc_val = data["metrics"].get("roc_auc", 0.0)
            ax.plot(fpr, tpr, label=f"{name} (AUC = {auc_val:.4f})")

    ax.set_xlabel("False Positive Rate", fontsize=11, fontweight="bold")
    ax.set_ylabel("True Positive Rate (Recall)", fontsize=11, fontweight="bold")
    ax.set_title("Receiver Operating Characteristic (ROC) Comparison", fontsize=13, fontweight="bold", pad=12)
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    fig.savefig(save_path, bbox_inches="tight")
    plt.close(fig)


def plot_model_comparison_chart(results_df: pd.DataFrame, save_path: Path):
    """Generate multi-metric side-by-side bar chart comparison."""
    fig, ax = plt.subplots(figsize=(12, 6), dpi=300)
    metrics = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    available_metrics = [m for m in metrics if m in results_df.columns]
    
    df_plot = results_df.set_index("model")[available_metrics]
    df_plot.plot(kind="bar", ax=ax, colormap="viridis", width=0.8)
    
    ax.set_title("ML Model Benchmark Comparison", fontsize=14, fontweight="bold", pad=14)
    ax.set_ylabel("Score (0.00 - 1.00)", fontsize=11, fontweight="bold")
    ax.set_xlabel("Model Architecture", fontsize=11, fontweight="bold")
    ax.set_ylim(0.70, 1.02)
    ax.grid(axis="y", linestyle="--", alpha=0.7)
    plt.xticks(rotation=30, ha="right", fontsize=9)
    plt.legend(title="Metric", loc="lower right", fontsize=9)
    plt.tight_layout()
    fig.savefig(save_path, bbox_inches="tight")
    plt.close(fig)
