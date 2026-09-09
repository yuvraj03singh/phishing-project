import sys
import importlib
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
ML_TRAINING = ROOT / "ml-training"
ML_SERVICE = ROOT / "ml-service"

for p in [str(ML_TRAINING), str(ML_SERVICE), str(ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from features.url_features import URLFeatureExtractor, calculate_entropy
except ImportError:
    feat_mod = importlib.import_module("features.url_features")
    URLFeatureExtractor = getattr(feat_mod, "URLFeatureExtractor")
    calculate_entropy = getattr(feat_mod, "calculate_entropy")


@pytest.fixture
def extractor():
    return URLFeatureExtractor()


def test_benign_url_features(extractor):
    url = "https://www.google.com/search?q=machine+learning"
    feats = extractor.extract_features(url)
    
    assert feats["is_https"] == 1
    assert feats["has_ip_address"] == 0
    assert feats["has_at_symbol"] == 0
    assert feats["has_suspicious_tld"] == 0
    assert feats["num_query_params"] == 1
    assert feats["url_length"] > 10
    assert feats["num_digits"] == 0


def test_phishing_ip_url_features(extractor):
    url = "http://192.168.1.100:8080/login/verify.php?user=victim"
    feats = extractor.extract_features(url)
    
    assert feats["has_ip_address"] == 1
    assert feats["is_https"] == 0
    assert feats["has_custom_port"] == 1
    assert feats["has_suspicious_keyword"] == 1
    assert feats["dot_count"] >= 3


def test_at_symbol_credential_lure(extractor):
    url = "http://admin:pass@fake-bank.login.xyz/secure"
    feats = extractor.extract_features(url)
    
    assert feats["has_at_symbol"] == 1
    assert feats["has_suspicious_tld"] == 1
    assert feats["has_suspicious_keyword"] == 1


def test_entropy_calculation():
    # Low entropy for repetitive string
    low_e = calculate_entropy("aaaaaaa")
    # High entropy for random characters
    high_e = calculate_entropy("a8#f!9X_q1$zL")
    assert high_e > low_e
