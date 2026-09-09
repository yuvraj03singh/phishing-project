# Empirical Results & Evaluation

The benchmark was executed across 5,455 authenticated URLs (2,655 Legitimate, 2,800 Phishing). Evaluation on the untouched 15% Holdout Test Set ($N=819$) yielded the following performance metrics:

| Model Architecture | Accuracy | Precision | Recall | Specificity | F1-Score | ROC-AUC | FNR | Avg Latency (ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hybrid (Stacking Meta-Learner)** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **0.0000** | 0.280 |
| **Hybrid (Soft Voting)** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **0.0000** | 0.278 |
| **XGBoost Classifier** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.009 |
| **LightGBM Classifier** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.006 |
| **Gradient Boosting** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.003 |
| **Random Forest** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.092 |
| **Extra Trees** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.091 |
| **Logistic Regression** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.001 |
| **Support Vector Machine (RBF)** | 0.9988 | 1.0000 | 0.9976 | 1.0000 | 0.9988 | 1.0000 | 0.0024 | 0.023 |
| **K-Nearest Neighbors (k=5)** | 0.9963 | 1.0000 | 0.9929 | 1.0000 | 0.9964 | 0.9988 | 0.0071 | 0.026 |

All generated visual artifacts, ROC curves, and confusion matrices are persisted under `ml-training/evaluation/reports/`.
