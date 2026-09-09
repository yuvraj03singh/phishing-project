"""
Preprocessing Pipeline for URL Feature Vectors.
Provides consistent imputation, scaling, variance thresholding,
and serializable pipeline artifacts for zero train/test leakage.
"""

from typing import List, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import RobustScaler, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import VarianceThreshold


class PhishingPreprocessingPipeline:
    """
    Encapsulates preprocessing transformations fitted strictly on training data.
    Ensures zero data leakage and consistent transforms during inference.
    """

    def __init__(self, scaler_type: str = "robust", variance_threshold: float = 0.0):
        self.scaler_type = scaler_type
        self.variance_threshold = variance_threshold
        self.feature_names_: Optional[List[str]] = None
        self.selected_feature_names_: Optional[List[str]] = None
        
        scaler = RobustScaler() if scaler_type == "robust" else StandardScaler()
        
        self.pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("variance_selector", VarianceThreshold(threshold=variance_threshold)),
            ("scaler", scaler)
        ])

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
        """Fit the preprocessing pipeline on training features only."""
        self.feature_names_ = list(X.columns)
        self.pipeline.fit(X, y)
        
        # Determine remaining features after variance thresholding
        selector: VarianceThreshold = self.pipeline.named_steps["variance_selector"]
        support = selector.get_support()
        self.selected_feature_names_ = [f for f, s in zip(self.feature_names_, support) if s]
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Transform features into scaled numpy array."""
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        if isinstance(X, pd.DataFrame):
            # Ensure correct column ordering
            if self.feature_names_:
                for col in self.feature_names_:
                    if col not in X.columns:
                        X[col] = 0.0
                X = X[self.feature_names_]
        return self.pipeline.transform(X)

    def fit_transform(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> np.ndarray:
        return self.fit(X, y).transform(X)
