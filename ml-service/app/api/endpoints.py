"""
FastAPI Route Handlers for ML Inference Microservice.
"""

import time
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.config import settings
from app.core.security import validate_and_sanitize_url
from app.schemas.prediction import (
    PredictRequest, PredictResponse,
    BatchPredictRequest, BatchPredictResponse,
    HealthResponse, FeaturesResponse, FeatureMetadata
)
from app.services.predictor import predictor
from app.services.extractor import ProductionFeatureExtractor

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["System Health"])
async def health_check():
    """System health check and runtime status."""
    uptime = round(time.time() - predictor.start_time, 2)
    return HealthResponse(
        status="healthy" if predictor.is_loaded else "degraded",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        model_loaded=predictor.is_loaded,
        model_version=predictor.metadata.get("model_version"),
        uptime_seconds=uptime
    )


@router.get("/model-info", tags=["Model Metadata"])
async def get_model_info():
    """Return model architecture, training metrics, and feature list."""
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is currently unavailable or still loading."
        )
    return {
        "success": True,
        "data": predictor.metadata
    }


@router.get("/features", response_model=FeaturesResponse, tags=["Feature Registry"])
async def get_registered_features():
    """Return catalog of all registered lexical, structural, and security features."""
    descriptions = {
        "url_length": ("length", "Total character length of the entire URL string"),
        "hostname_length": ("length", "Length of the Fully Qualified Domain Name (FQDN)"),
        "path_length": ("length", "Length of URL path component"),
        "query_length": ("length", "Length of URL query parameters"),
        "fragment_length": ("length", "Length of URL anchor fragment"),
        "domain_length": ("length", "Length of registered domain name"),
        "num_digits": ("character_counts", "Count of numeric digits in the URL"),
        "num_letters": ("character_counts", "Count of alphabetical characters in the URL"),
        "num_special_chars": ("character_counts", "Count of special/punctuation characters"),
        "digit_ratio": ("character_counts", "Ratio of numeric digits to total URL length"),
        "special_ratio": ("character_counts", "Ratio of special characters to total URL length"),
        "dot_count": ("character_counts", "Total occurrences of period character ('.')"),
        "hyphen_count": ("character_counts", "Total occurrences of hyphen character ('-')"),
        "underscore_count": ("character_counts", "Total occurrences of underscore character ('_')"),
        "slash_count": ("character_counts", "Total occurrences of slash character ('/')"),
        "question_mark_count": ("character_counts", "Total occurrences of question mark ('?')"),
        "equal_count": ("character_counts", "Total occurrences of equals sign ('=')"),
        "at_count": ("character_counts", "Total occurrences of '@' symbol"),
        "ampersand_count": ("character_counts", "Total occurrences of ampersand ('&')"),
        "percent_count": ("character_counts", "Total occurrences of percent sign ('%')"),
        "colon_count": ("character_counts", "Total occurrences of colon (':')"),
        "semicolon_count": ("character_counts", "Total occurrences of semicolon (';')"),
        "comma_count": ("character_counts", "Total occurrences of comma (',')"),
        "tilde_count": ("character_counts", "Total occurrences of tilde ('~')"),
        "double_slash_count": ("character_counts", "Occurrences of consecutive slashes ('//') in path"),
        "num_subdomains": ("structural", "Number of subdomain levels in hostname"),
        "path_depth": ("structural", "Depth of URL path directory structure"),
        "num_query_params": ("structural", "Number of key-value parameters in query string"),
        "has_ip_address": ("security_indicators", "Binary indicator for raw IP address in hostname"),
        "is_https": ("security_indicators", "Binary indicator for HTTPS TLS encryption"),
        "has_custom_port": ("security_indicators", "Binary indicator for non-standard TCP port"),
        "has_at_symbol": ("security_indicators", "Binary indicator for presence of '@' redirection token"),
        "is_shortened": ("security_indicators", "Binary indicator for known URL shortening service"),
        "has_suspicious_tld": ("security_indicators", "Binary indicator for frequently abused TLDs"),
        "has_suspicious_keyword": ("security_indicators", "Binary indicator for phishing lure keywords"),
        "suspicious_keyword_count": ("security_indicators", "Total frequency count of detected phishing keywords"),
        "hyphen_in_hostname": ("security_indicators", "Binary indicator for hyphen character inside domain"),
        "has_prefix_suffix": ("security_indicators", "Binary indicator for prefix/suffix separator tokens"),
        "is_encoded": ("security_indicators", "Binary indicator for hexadecimal percent-encoding"),
        "url_entropy": ("entropy", "Shannon entropy score measuring randomness of entire URL"),
        "hostname_entropy": ("entropy", "Shannon entropy score measuring randomness of hostname")
    }

    feature_list = [
        FeatureMetadata(name=name, category=meta[0], description=meta[1])
        for name, meta in descriptions.items()
    ]

    return FeaturesResponse(
        total_features=len(feature_list),
        features=feature_list
    )


@router.post("/predict", response_model=PredictResponse, tags=["Phishing Prediction"])
async def predict_url(payload: PredictRequest):
    """
    Perform lexical URL risk evaluation.
    Returns prediction ('phishing' / 'legitimate'), probability, risk tier, and contributing factors.
    """
    is_valid, sanitized_url, err_msg = validate_and_sanitize_url(payload.url)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_URL", "message": err_msg}
        )

    try:
        return predictor.predict_single(sanitized_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INFERENCE_ERROR", "message": f"Inference failed: {str(e)}"}
        )


@router.post("/predict/batch", response_model=BatchPredictResponse, tags=["Phishing Prediction"])
async def predict_batch_urls(payload: BatchPredictRequest):
    """
    Perform batch URL risk evaluation for a list of URLs (max 500 items).
    """
    if len(payload.urls) > settings.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch size exceeds maximum limit of {settings.MAX_BATCH_SIZE} URLs."
        )

    sanitized_urls = []
    for u in payload.urls:
        valid, s_url, _ = validate_and_sanitize_url(u)
        if valid:
            sanitized_urls.append(s_url)

    if not sanitized_urls:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No valid URLs provided in batch request."
        )

    return predictor.predict_batch(sanitized_urls)
