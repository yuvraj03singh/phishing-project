"""
Hybrid / Ensemble Machine Learning Architectures for Phishing Detection.
Implements:
1. Soft Voting Classifier (Weighted Probability Combination)
2. Stacking Classifier (2-Tier Out-of-Fold Meta Learning)
"""

from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin, clone
from sklearn.model_selection import StratifiedKFold
from sklearn.linear_model import LogisticRegression


class HybridVotingClassifier(BaseEstimator, ClassifierMixin):
    """
    Weighted Soft-Voting Ensemble combining class probabilities from multiple base estimators.
    """

    def __init__(self, estimators: List[Tuple[str, Any]], weights: Optional[List[float]] = None):
        self.estimators = estimators
        self.weights = weights
        self.named_estimators_: Dict[str, Any] = {}

    def fit(self, X: np.ndarray, y: np.ndarray):
        """Fit all underlying base estimators."""
        self.classes_ = np.unique(y)
        self.named_estimators_ = {}
        for name, est in self.estimators:
            fitted_est = clone(est)
            fitted_est.fit(X, y)
            self.named_estimators_[name] = fitted_est
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Compute weighted probability averages."""
        probas = []
        for name, est in self.named_estimators_.items():
            probas.append(est.predict_proba(X))

        if self.weights is None:
            weights = np.ones(len(self.estimators)) / len(self.estimators)
        else:
            weights = np.array(self.weights, dtype=float)
            weights = weights / np.sum(weights)

        avg_proba = np.zeros_like(probas[0])
        for w, p in zip(weights, probas):
            avg_proba += w * p
        return avg_proba

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class with highest weighted probability."""
        proba = self.predict_proba(X)
        return self.classes_[np.argmax(proba, axis=1)]


class HybridStackingClassifier(BaseEstimator, ClassifierMixin):
    """
    2-Tier Stacking Ensemble.
    Uses out-of-fold cross-validated probability predictions from base learners
    to train a meta-learner without data leakage.
    """

    def __init__(
        self,
        base_estimators: List[Tuple[str, Any]],
        meta_learner: Optional[Any] = None,
        n_splits: int = 5,
        random_state: int = 42
    ):
        self.base_estimators = base_estimators
        self.meta_learner = meta_learner or LogisticRegression(C=1.0, max_iter=1000, random_state=random_state)
        self.n_splits = n_splits
        self.random_state = random_state
        self.fitted_base_estimators_: List[Tuple[str, Any]] = []
        self.fitted_meta_learner_: Optional[Any] = None

    def fit(self, X: np.ndarray, y: np.ndarray):
        """Perform out-of-fold cross validation to train meta learner, then fit base learners on full X."""
        self.classes_ = np.unique(y)
        cv = StratifiedKFold(n_splits=self.n_splits, shuffle=True, random_state=self.random_state)
        
        # Matrix to hold out-of-fold probability predictions (N samples x M estimators)
        oof_meta_features = np.zeros((X.shape[0], len(self.base_estimators)))

        for train_idx, val_idx in cv.split(X, y):
            X_tr, y_tr = X[train_idx], y[train_idx]
            X_va = X[val_idx]

            for i, (name, est) in enumerate(self.base_estimators):
                cloned_est = clone(est)
                cloned_est.fit(X_tr, y_tr)
                # Save phishing class probability (column index 1)
                oof_meta_features[val_idx, i] = cloned_est.predict_proba(X_va)[:, 1]

        # Fit Meta-Learner on out-of-fold predictions
        self.fitted_meta_learner_ = clone(self.meta_learner)
        self.fitted_meta_learner_.fit(oof_meta_features, y)

        # Retrain all base learners on the full dataset
        self.fitted_base_estimators_ = []
        for name, est in self.base_estimators:
            fitted_est = clone(est)
            fitted_est.fit(X, y)
            self.fitted_base_estimators_.append((name, fitted_est))

        return self

    def _get_meta_features(self, X: np.ndarray) -> np.ndarray:
        """Extract meta features from base estimators for new inputs."""
        meta_features = np.zeros((X.shape[0], len(self.fitted_base_estimators_)))
        for i, (name, est) in enumerate(self.fitted_base_estimators_):
            meta_features[:, i] = est.predict_proba(X)[:, 1]
        return meta_features

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Compute final stacked probabilities via the meta learner."""
        meta_features = self._get_meta_features(X)
        return self.fitted_meta_learner_.predict_proba(meta_features)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Compute final stacked predictions."""
        meta_features = self._get_meta_features(X)
        return self.fitted_meta_learner_.predict(meta_features)
