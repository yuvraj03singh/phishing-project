"""
Self-contained URL Feature Extraction Service for ML Microservice.
Ensures zero runtime dependency on offline training packages while maintaining
100% exact parity with training feature logic.
"""

import math
import re
import urllib.parse
from typing import Dict, Any, List
import tldextract

SHORTENING_SERVICES = {
    "bit.ly", "goo.gl", "tinyurl.com", "t.co", "ow.ly", "is.gd", "buff.ly",
    "adf.ly", "bit.do", "tiny.cc", "lnkd.in", "db.tt", "qr.ae", "cur.lv",
    "ity.im", "q.gs", "po.st", "bc.vc", "twitthis.com", "u.to", "j.mp",
    "buzurl.com", "cutt.ly", "shorte.st", "rebrand.ly", "shorturl.at"
}

SUSPICIOUS_TLDS = {
    "zip", "mov", "xyz", "top", "work", "loan", "tk", "ml", "ga", "cf", "gq",
    "click", "fit", "surf", "country", "stream", "gdn", "mom", "kim", "party", "racing",
    "icu", "monster", "rest", "cam", "quest"
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "account", "banking",
    "update", "confirm", "security", "wallet", "paypal", "appleid", "netflix",
    "password", "credential", "suspend", "recover", "authenticate", "service",
    "ebayisapi", "webscr", "auth"
]

IPV4_PATTERN = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
)

IPV6_PATTERN = re.compile(
    r"^\[?([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\]?$"
)


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    freq: Dict[str, int] = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    length = len(text)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


class ProductionFeatureExtractor:
    """Extracts features identical to the training feature schema."""

    def __init__(self):
        self._tld_extractor = tldextract.TLDExtract(suffix_list_urls=None)

    def extract(self, url: str) -> Dict[str, Any]:
        url = url.strip()
        parse_target = url if "://" in url else "http://" + url

        try:
            parsed = urllib.parse.urlparse(parse_target)
        except Exception:
            parsed = urllib.parse.urlparse("http://malformed.invalid/")

        hostname = parsed.hostname or ""
        path = parsed.path or ""
        query = parsed.query or ""
        fragment = parsed.fragment or ""
        scheme = parsed.scheme.lower() if parsed.scheme else "http"

        tld_res = self._tld_extractor(hostname)
        domain = tld_res.domain
        suffix = tld_res.suffix.lower()
        subdomain = tld_res.subdomain

        url_len = len(url)
        hostname_len = len(hostname)
        path_len = len(path)
        query_len = len(query)
        fragment_len = len(fragment)
        domain_len = len(domain)

        num_digits = sum(c.isdigit() for c in url)
        num_letters = sum(c.isalpha() for c in url)
        num_special = url_len - (num_digits + num_letters)

        digit_ratio = round(num_digits / url_len, 4) if url_len > 0 else 0.0
        special_ratio = round(num_special / url_len, 4) if url_len > 0 else 0.0

        dot_count = url.count(".")
        hyphen_count = url.count("-")
        underscore_count = url.count("_")
        slash_count = url.count("/")
        question_count = url.count("?")
        equal_count = url.count("=")
        at_count = url.count("@")
        amp_count = url.count("&")
        percent_count = url.count("%")
        colon_count = url.count(":")
        semicolon_count = url.count(";")
        comma_count = url.count(",")
        tilde_count = url.count("~")
        double_slash_count = url.count("//") - (1 if "://" in url else 0)
        double_slash_count = max(0, double_slash_count)

        subdomain_parts = [p for p in subdomain.split(".") if p]
        num_subdomains = len(subdomain_parts)
        path_depth = len([p for p in path.split("/") if p])
        num_query_params = len(urllib.parse.parse_qs(query)) if query else 0

        is_ip = 1 if (IPV4_PATTERN.match(hostname) or IPV6_PATTERN.match(hostname)) else 0
        is_https = 1 if scheme == "https" else 0
        has_at_symbol = 1 if at_count > 0 else 0

        has_custom_port = 0
        if parsed.port:
            if (scheme == "http" and parsed.port != 80) or (scheme == "https" and parsed.port != 443):
                has_custom_port = 1

        is_shortened = 1 if (hostname.lower() in SHORTENING_SERVICES or f"{domain}.{suffix}".lower() in SHORTENING_SERVICES) else 0
        has_suspicious_tld = 1 if suffix in SUSPICIOUS_TLDS else 0

        url_lower = url.lower()
        keyword_hits = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)
        has_suspicious_keyword = 1 if keyword_hits > 0 else 0

        hyphen_in_hostname = 1 if "-" in hostname else 0
        is_encoded = 1 if percent_count > 0 else 0

        url_entropy = calculate_entropy(url)
        hostname_entropy = calculate_entropy(hostname)
        has_prefix_suffix = 1 if ("-" in domain or "_" in domain) else 0

        return {
            "url_length": url_len,
            "hostname_length": hostname_len,
            "path_length": path_len,
            "query_length": query_len,
            "fragment_length": fragment_len,
            "domain_length": domain_len,
            "num_digits": num_digits,
            "num_letters": num_letters,
            "num_special_chars": num_special,
            "digit_ratio": digit_ratio,
            "special_ratio": special_ratio,
            "dot_count": dot_count,
            "hyphen_count": hyphen_count,
            "underscore_count": underscore_count,
            "slash_count": slash_count,
            "question_mark_count": question_count,
            "equal_count": equal_count,
            "at_count": at_count,
            "ampersand_count": amp_count,
            "percent_count": percent_count,
            "colon_count": colon_count,
            "semicolon_count": semicolon_count,
            "comma_count": comma_count,
            "tilde_count": tilde_count,
            "double_slash_count": double_slash_count,
            "num_subdomains": num_subdomains,
            "path_depth": path_depth,
            "num_query_params": num_query_params,
            "has_ip_address": is_ip,
            "is_https": is_https,
            "has_custom_port": has_custom_port,
            "has_at_symbol": has_at_symbol,
            "is_shortened": is_shortened,
            "has_suspicious_tld": has_suspicious_tld,
            "has_suspicious_keyword": has_suspicious_keyword,
            "suspicious_keyword_count": keyword_hits,
            "hyphen_in_hostname": hyphen_in_hostname,
            "has_prefix_suffix": has_prefix_suffix,
            "is_encoded": is_encoded,
            "url_entropy": url_entropy,
            "hostname_entropy": hostname_entropy
        }
