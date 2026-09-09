"""
Model Factory for Phishing Detection Classifiers.
Provides candidate baseline models with production hyperparameters and search spaces.
"""

from typing import Dict, Any
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier
)
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
import xgboost as xgb
import lightgbm as lgb


def get_baseline_models(random_state: int = 42) -> Dict[str, Any]:
    """Return dictionary of instantiated baseline ML classifiers."""
    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            random_state=random_state
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=150,
            max_depth=20,
            min_samples_split=4,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=random_state
        ),
        "Extra Trees": ExtraTreesClassifier(
            n_estimators=150,
            max_depth=20,
            min_samples_split=4,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=random_state
        ),
        "Support Vector Machine": SVC(
            C=1.0,
            kernel="rbf",
            probability=True,
            random_state=random_state
        ),
        "K-Nearest Neighbors": KNeighborsClassifier(
            n_neighbors=5,
            weights="distance",
            n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=5,
            random_state=random_state
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=6,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric="logloss",
            random_state=random_state,
            n_jobs=-1
        ),
        "LightGBM": lgb.LGBMClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=6,
            num_leaves=31,
            subsample=0.85,
            random_state=random_state,
            n_jobs=-1,
            verbose=-1
        )
    }
    return models
