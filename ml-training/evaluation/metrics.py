"""
Comprehensive Evaluation Metrics Suite for Cybersecurity URL Classification.
Computes Accuracy, Precision, Recall, Specificity, F1-Score, ROC-AUC, PR-AUC,
False Positive Rate (FPR), False Negative Rate (FNR), and Latency.
"""

import time
from typing import Dict, Any, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)


def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None,
    latency_ms: Optional[float] = None
) -> Dict[str, Any]:
    """Calculate thorough classification performance metrics."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    # Confusion matrix calculations
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    # ROC-AUC and PR-AUC
    roc_auc = 0.0
    pr_auc = 0.0
    if y_proba is not None:
        try:
            if y_proba.ndim > 1:
                proba_col = y_proba[:, 1]
            else:
                proba_col = y_proba
            roc_auc = roc_auc_score(y_true, proba_col)
            pr_auc = average_precision_score(y_true, proba_col)
        except Exception:
            roc_auc = float("nan")
            pr_auc = float("nan")

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "specificity": round(float(specificity), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "false_positive_rate": round(float(fpr), 4),
        "false_negative_rate": round(float(fnr), 4),
        "true_positives": int(tp),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "latency_ms_per_sample": round(float(latency_ms), 3) if latency_ms is not None else None
    }
