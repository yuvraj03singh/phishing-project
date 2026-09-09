"""
Pydantic Schemas for Request / Response Validation in FastAPI ML Microservice.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    url: str = Field(..., description="The full URL string to analyze for phishing risks", json_schema_extra={"example": "https://secure-login.appleid-verify.xyz/auth"})


class BatchPredictRequest(BaseModel):
    urls: List[str] = Field(..., description="List of URL strings to analyze", max_length=500)


class ExplanationItem(BaseModel):
    feature: str = Field(..., description="Name of the feature")
    value: Any = Field(..., description="Extracted value for this URL")
    contribution: str = Field(..., description="Human-readable explanation of how this contributed to the prediction")
    severity: str = Field("INFO", description="Severity level: INFO, WARNING, or CRITICAL")


class PredictResponse(BaseModel):
    url: str
    prediction: str = Field(..., description="'legitimate' or 'phishing'")
    is_phishing: bool
    probability: float = Field(..., description="Model probability of being phishing (0.0 to 1.0)")
    risk_score: float = Field(..., description="Risk score percentage (0 to 100)")
    risk_level: str = Field(..., description="Risk classification: LOW, MEDIUM, HIGH, CRITICAL")
    model_version: str
    model_name: str
    inference_latency_ms: float
    features: Dict[str, Any]
    explanations: List[ExplanationItem]
    disclaimer: str = "This prediction is an ML-based risk assessment and does not constitute 100% certainty."


class BatchItemResponse(BaseModel):
    url: str
    prediction: str
    is_phishing: bool
    probability: float
    risk_level: str
    risk_score: float


class BatchPredictResponse(BaseModel):
    total_scanned: int
    phishing_count: int
    legitimate_count: int
    total_time_ms: float
    results: List[BatchItemResponse]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    model_version: Optional[str]
    uptime_seconds: float


class FeatureMetadata(BaseModel):
    name: str
    category: str
    description: str


class FeaturesResponse(BaseModel):
    total_features: int
    features: List[FeatureMetadata]
