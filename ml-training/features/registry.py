"""
Feature Registry for Phishing Detection.
Maintains feature metadata, descriptions, importance categories, and enables
dynamic extraction of feature arrays for training and inference.
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd
from .url_features import URLFeatureExtractor


class FeatureRegistry:
    """Registry maintaining feature metadata, category tags, and vector transformations."""

    CATEGORIES = {
        "length": [
            "url_length", "hostname_length", "path_length", "query_length",
            "fragment_length", "domain_length"
        ],
        "character_counts": [
            "num_digits", "num_letters", "num_special_chars", "digit_ratio",
            "special_ratio", "dot_count", "hyphen_count", "underscore_count",
            "slash_count", "question_mark_count", "equal_count", "at_count",
            "ampersand_count", "percent_count", "colon_count", "semicolon_count",
            "comma_count", "tilde_count", "double_slash_count"
        ],
        "structural": [
            "num_subdomains", "path_depth", "num_query_params", "has_prefix_suffix"
        ],
        "security_indicators": [
            "has_ip_address", "is_https", "has_custom_port", "has_at_symbol",
            "is_shortened", "has_suspicious_tld", "has_suspicious_keyword",
            "suspicious_keyword_count", "hyphen_in_hostname", "is_encoded"
        ],
        "entropy": [
            "url_entropy", "hostname_entropy"
        ]
    }

    FEATURE_DESCRIPTIONS = {
        "url_length": "Total character length of the entire URL string",
        "hostname_length": "Length of the Fully Qualified Domain Name (FQDN)",
        "path_length": "Length of URL path component",
        "query_length": "Length of URL query parameters",
        "fragment_length": "Length of URL anchor fragment",
        "domain_length": "Length of registered domain name without subdomain/TLD",
        "num_digits": "Count of numeric digits in the URL",
        "num_letters": "Count of alphabetical characters in the URL",
        "num_special_chars": "Count of special/punctuation characters",
        "digit_ratio": "Ratio of numeric digits to total URL length",
        "special_ratio": "Ratio of special characters to total URL length",
        "dot_count": "Total occurrences of period character ('.')",
        "hyphen_count": "Total occurrences of hyphen character ('-')",
        "underscore_count": "Total occurrences of underscore character ('_')",
        "slash_count": "Total occurrences of slash character ('/')",
        "question_mark_count": "Total occurrences of question mark ('?')",
        "equal_count": "Total occurrences of equals sign ('=')",
        "at_count": "Total occurrences of '@' symbol",
        "ampersand_count": "Total occurrences of ampersand ('&')",
        "percent_count": "Total occurrences of percent sign ('%')",
        "colon_count": "Total occurrences of colon (':')",
        "semicolon_count": "Total occurrences of semicolon (';')",
        "comma_count": "Total occurrences of comma (',')",
        "tilde_count": "Total occurrences of tilde ('~')",
        "double_slash_count": "Occurrences of consecutive slashes ('//') in path/query",
        "num_subdomains": "Number of subdomain levels in hostname",
        "path_depth": "Depth of URL path directory structure",
        "num_query_params": "Number of key-value parameters in query string",
        "has_ip_address": "Binary indicator for raw IP address in hostname (IPv4/IPv6)",
        "is_https": "Binary indicator for HTTPS TLS encryption scheme",
        "has_custom_port": "Binary indicator for non-standard TCP port (e.g. 8080, 8888)",
        "has_at_symbol": "Binary indicator for presence of '@' credential redirection token",
        "is_shortened": "Binary indicator for known URL shortening service (bit.ly, tinyurl, etc.)",
        "has_suspicious_tld": "Binary indicator for frequently abused TLDs (e.g. .xyz, .top, .tk)",
        "has_suspicious_keyword": "Binary indicator for phishing lure keywords (e.g. login, verify, secure)",
        "suspicious_keyword_count": "Total frequency count of detected phishing keywords",
        "hyphen_in_hostname": "Binary indicator for hyphen character inside domain name",
        "has_prefix_suffix": "Binary indicator for prefix/suffix separator tokens in domain",
        "is_encoded": "Binary indicator for hexadecimal percent-encoding tokens",
        "url_entropy": "Shannon entropy score measuring randomness of entire URL",
        "hostname_entropy": "Shannon entropy score measuring randomness of hostname"
    }

    def __init__(self):
        self.extractor = URLFeatureExtractor()
        self.feature_names = self.extractor.get_feature_names()

    def get_all_feature_names(self) -> List[str]:
        return list(self.feature_names)

    def extract_from_url(self, url: str) -> Dict[str, Any]:
        return self.extractor.extract_features(url)

    def extract_features_df(self, urls: List[str]) -> pd.DataFrame:
        """Batch extract features for a list of URLs and return a pandas DataFrame."""
        records = [self.extractor.extract_features(u) for u in urls]
        return pd.DataFrame(records)[self.feature_names]

    def extract_feature_vector(self, url: str) -> np.ndarray:
        """Extract ordered numeric feature vector for a single URL."""
        feats = self.extract_from_url(url)
        return np.array([feats[k] for k in self.feature_names], dtype=np.float32)
