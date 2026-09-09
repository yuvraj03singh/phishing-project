import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "datasets"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

MODELS_DIR = BASE_DIR / "models"
MODEL_V1_DIR = MODELS_DIR / "v1"
EXPERIMENTS_DIR = BASE_DIR / "ml-training" / "experiments"
REPORTS_DIR = BASE_DIR / "ml-training" / "evaluation" / "reports"

# Ensure directories exist
for directory in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODEL_V1_DIR, EXPERIMENTS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Random Seed for Reproducibility
RANDOM_STATE = 42

# Dataset Split Configuration
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Cross Validation
CV_FOLDS = 5

# Risk Thresholds
RISK_THRESHOLDS = {
    "LOW": (0.00, 0.29),
    "MEDIUM": (0.30, 0.59),
    "HIGH": (0.60, 0.79),
    "CRITICAL": (0.80, 1.00)
}

# Feature Settings
SUSPICIOUS_TLDS = {
    "zip", "mov", "xyz", "top", "work", "loan", "tk", "ml", "ga", "cf", "gq", 
    "click", "fit", "surf", "country", "stream", "gdn", "mom", "kim", "party", "racing"
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "account", "banking",
    "update", "confirm", "security", "wallet", "paypal", "appleid", "netflix",
    "password", "credential", "suspend", "recover", "authenticate", "service"
]
