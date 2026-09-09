"""
Production Inference & Explainability Service.
Loads model and preprocessing artifacts once at startup and performs sub-10ms predictions.
Generates human-readable, balanced contributing factor explanations.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.services.extractor import ProductionFeatureExtractor
from app.schemas.prediction import ExplanationItem, PredictResponse, BatchItemResponse, BatchPredictResponse

logger = logging.getLogger("PredictorService")


class ProductionPredictor:
    """Singleton service for loading ML artifacts and executing model inference with explanations."""

    def __init__(self, model_dir: Optional[Path] = None):
        self.model_dir = model_dir or settings.MODEL_DIR
        self.extractor = ProductionFeatureExtractor()
        self.pipeline: Any = None
        self.model: Any = None
        self.metadata: Dict[str, Any] = {}
        self.thresholds: Dict[str, Tuple[float, float]] = {}
        self.feature_names: List[str] = []
        self.is_loaded: bool = False
        self.start_time: float = time.time()
        self.load_artifacts()

    def load_artifacts(self):
        """Load serialized pipeline, model, and metadata from disk."""
        try:
            logger.info("Loading ML artifacts from: %s", self.model_dir)
            pipeline_path = self.model_dir / "pipeline.joblib"
            model_path = self.model_dir / "model.joblib"
            meta_path = self.model_dir / "metadata.json"
            thresh_path = self.model_dir / "thresholds.json"
            features_path = self.model_dir / "feature_names.json"

            if not pipeline_path.exists() or not model_path.exists():
                logger.warning("Model or pipeline artifacts not found at %s. Will retry or mock.", self.model_dir)
                return

            self.pipeline = joblib.load(pipeline_path)
            self.model = joblib.load(model_path)

            if meta_path.exists():
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)

            if thresh_path.exists():
                with open(thresh_path, "r") as f:
                    self.thresholds = json.load(f)
            else:
                self.thresholds = {
                    "LOW": [0.0, 0.29],
                    "MEDIUM": [0.30, 0.59],
                    "HIGH": [0.60, 0.79],
                    "CRITICAL": [0.80, 1.00]
                }

            if features_path.exists():
                with open(features_path, "r") as f:
                    self.feature_names = json.load(f)

            self.is_loaded = True
            logger.info("Successfully loaded ML model '%s' (v%s) with %d features.",
                        self.metadata.get("model_name", "Unknown"),
                        self.metadata.get("model_version", "1.0.0"),
                        len(self.feature_names))
        except Exception as e:
            logger.error("Failed to load ML artifacts: %s", str(e), exc_info=True)
            self.is_loaded = False

    def get_risk_level(self, proba: float) -> str:
        """Map probability to standardized risk level."""
        for level, bounds in self.thresholds.items():
            if bounds[0] <= proba <= bounds[1]:
                return level
        if proba >= 0.80:
            return "CRITICAL"
        elif proba >= 0.60:
            return "HIGH"
        elif proba >= 0.30:
            return "MEDIUM"
        return "LOW"

    def generate_explanations(self, features: Dict[str, Any], proba: float) -> List[ExplanationItem]:
        """
        Generate defensible, non-dogmatic explanations for model prediction.
        Avoids absolute claims and communicates contributing factors.
        """
        explanations: List[ExplanationItem] = []

        if features.get("has_ip_address", 0) == 1:
            explanations.append(ExplanationItem(
                feature="has_ip_address",
                value=1,
                contribution="Hostname uses a direct IP address rather than a registered domain name, commonly used to bypass reputation filters.",
                severity="CRITICAL"
            ))

        if features.get("has_at_symbol", 0) == 1:
            explanations.append(ExplanationItem(
                feature="has_at_symbol",
                value=features.get("at_count", 1),
                contribution="Contains '@' symbol in URL, often used in credential-harvesting or URL confusion attacks.",
                severity="CRITICAL"
            ))

        if features.get("has_suspicious_tld", 0) == 1:
            explanations.append(ExplanationItem(
                feature="has_suspicious_tld",
                value=1,
                contribution="Top-Level Domain (TLD) has a statistically high correlation with disposable phishing campaigns.",
                severity="HIGH"
            ))

        if features.get("has_suspicious_keyword", 0) == 1:
            count = features.get("suspicious_keyword_count", 1)
            explanations.append(ExplanationItem(
                feature="has_suspicious_keyword",
                value=count,
                contribution=f"Detected {count} authentication or account security lure keyword(s) in URL path/parameters.",
                severity="HIGH"
            ))

        if features.get("is_https", 1) == 0:
            explanations.append(ExplanationItem(
                feature="is_https",
                value=0,
                contribution="URL lacks HTTPS TLS encryption scheme (plain HTTP), presenting data transit risks.",
                severity="MEDIUM"
            ))

        if features.get("num_subdomains", 0) >= 3:
            explanations.append(ExplanationItem(
                feature="num_subdomains",
                value=features.get("num_subdomains"),
                contribution=f"Deep subdomain nesting ({features.get('num_subdomains')} levels) frequently indicates domain camouflage.",
                severity="MEDIUM"
            ))

        if features.get("url_entropy", 0.0) > 4.2:
            explanations.append(ExplanationItem(
                feature="url_entropy",
                value=features.get("url_entropy"),
                contribution=f"Elevated Shannon entropy ({features.get('url_entropy')}) indicates high randomness or programmatic obfuscation.",
                severity="MEDIUM"
            ))

        if features.get("url_length", 0) > 100:
            explanations.append(ExplanationItem(
                feature="url_length",
                value=features.get("url_length"),
                contribution=f"Unusually long URL structure ({features.get('url_length')} characters) often seen in tokenized tracking lures.",
                severity="INFO"
            ))

        if features.get("has_custom_port", 0) == 1:
            explanations.append(ExplanationItem(
                feature="has_custom_port",
                value=1,
                contribution="Non-standard web port specified in URL, atypical for standard legitimate web services.",
                severity="HIGH"
            ))

        if features.get("is_shortened", 0) == 1:
            explanations.append(ExplanationItem(
                feature="is_shortened",
                value=1,
                contribution="URL uses a URL shortening service which masks the final destination endpoint.",
                severity="MEDIUM"
            ))

        # If benign and no risks
        if not explanations and proba < 0.30:
            explanations.append(ExplanationItem(
                feature="clean_lexical_profile",
                value="Benign",
                contribution="URL conforms to standard structural conventions with no anomalous lexical or security indicators.",
                severity="INFO"
            ))

        return explanations

    def predict_single(self, url: str) -> PredictResponse:
        """Run complete inference and explanation pipeline on a single URL."""
        t0 = time.perf_counter()

        # Step 1: Feature Extraction
        features = self.extractor.extract(url)

        # Step 2: Preprocess & Predict
        if self.is_loaded and self.pipeline and self.model:
            df_feat = pd.DataFrame([features])
            X_transformed = self.pipeline.transform(df_feat)
            proba_arr = self.model.predict_proba(X_transformed)[0]
            phishing_proba = float(proba_arr[1])
        else:
            # Fallback heuristic if artifacts not yet loaded
            phishing_proba = 0.90 if (features["has_ip_address"] or features["has_at_symbol"]) else 0.05

        latency_ms = round((time.perf_counter() - t0) * 1000.0, 3)
        risk_score = round(phishing_proba * 100.0, 2)
        risk_level = self.get_risk_level(phishing_proba)
        is_phishing = phishing_proba >= 0.50
        prediction_label = "phishing" if is_phishing else "legitimate"

        explanations = self.generate_explanations(features, phishing_proba)

        return PredictResponse(
            url=url,
            prediction=prediction_label,
            is_phishing=is_phishing,
            probability=round(phishing_proba, 4),
            risk_score=risk_score,
            risk_level=risk_level,
            model_version=self.metadata.get("model_version", "1.0.0"),
            model_name=self.metadata.get("model_name", "Phishing Hybrid Classifier"),
            inference_latency_ms=latency_ms,
            features=features,
            explanations=explanations
        )

    def predict_batch(self, urls: List[str]) -> BatchPredictResponse:
        """Run batch inference for multiple URLs."""
        t0 = time.perf_counter()
        results: List[BatchItemResponse] = []
        phishing_count = 0
        legit_count = 0

        for url in urls:
            pred = self.predict_single(url)
            if pred.is_phishing:
                phishing_count += 1
            else:
                legit_count += 1

            results.append(BatchItemResponse(
                url=pred.url,
                prediction=pred.prediction,
                is_phishing=pred.is_phishing,
                probability=pred.probability,
                risk_level=pred.risk_level,
                risk_score=pred.risk_score
            ))

        total_time_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        return BatchPredictResponse(
            total_scanned=len(urls),
            phishing_count=phishing_count,
            legitimate_count=legit_count,
            total_time_ms=total_time_ms,
            results=results
        )


predictor = ProductionPredictor()
