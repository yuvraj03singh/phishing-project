import sys
import importlib
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure ml-service and ml-training directories are in python path
ROOT = Path(__file__).resolve().parent.parent.parent
ML_SERVICE = ROOT / "ml-service"
ML_TRAINING = ROOT / "ml-training"

for p in [str(ML_SERVICE), str(ML_TRAINING), str(ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except ImportError:
    app_main = importlib.import_module("app.main")
    app = getattr(app_main, "app")

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data


def test_features_endpoint():
    response = client.get("/features")
    assert response.status_code == 200
    data = response.json()
    assert data["total_features"] > 20
    assert len(data["features"]) > 20


def test_predict_legitimate_url():
    response = client.post("/predict", json={"url": "https://www.google.com/search?q=cybersecurity"})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "legitimate"
    assert data["is_phishing"] is False
    assert data["risk_level"] in ["LOW", "MEDIUM"]
    assert "features" in data
    assert "explanations" in data


def test_predict_phishing_url():
    response = client.post("/predict", json={"url": "http://192.168.1.1:8080/bankofamerica-login-verify.xyz/auth.php"})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "phishing"
    assert data["is_phishing"] is True
    assert data["risk_score"] > 50.0
    assert len(data["explanations"]) > 0


def test_predict_invalid_url():
    response = client.post("/predict", json={"url": "javascript:alert(1)"})
    assert response.status_code in [422, 400]


def test_batch_prediction():
    urls = [
        "https://github.com/torvalds/linux",
        "http://paypal.com.account-update.verify-live.top/signin",
        "https://en.wikipedia.org/wiki/Main_Page"
    ]
    response = client.post("/predict/batch", json={"urls": urls})
    assert response.status_code == 200
    data = response.json()
    assert data["total_scanned"] == 3
    assert len(data["results"]) == 3
