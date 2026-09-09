"""
Security & Input Sanitization for URL Analysis.
Prevents SSRF, malformed payload injections, and buffer overflow attempts.
Purely passive lexical inspection - NO external network requests.
"""

import re
import urllib.parse
from typing import Tuple

VALID_URL_SCHEMES = {"http", "https", "ftp"}
MAX_URL_LENGTH = 2048


def validate_and_sanitize_url(raw_url: str) -> Tuple[bool, str, str]:
    """
    Validate input URL.
    Returns: (is_valid: bool, sanitized_url: str, error_message: str)
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "", "URL must be a non-empty string."

    url = raw_url.strip()

    if len(url) > MAX_URL_LENGTH:
        return False, "", f"URL exceeds maximum allowed length of {MAX_URL_LENGTH} characters."

    if len(url) < 3:
        return False, "", "URL is too short to be a valid web address."

    # Check for disallowed scheme attempts (e.g. javascript:, data:, file:)
    lower_url = url.lower()
    if lower_url.startswith(("javascript:", "data:", "vbscript:", "file:", "about:")):
        return False, "", "Unsupported or unsafe URL scheme."

    # Add standard scheme if omitted for parsing validation
    parse_target = url if "://" in url else f"http://{url}"

    try:
        parsed = urllib.parse.urlparse(parse_target)
        if not parsed.netloc and not parsed.path:
            return False, "", "Malformed URL: unable to identify hostname."
    except Exception as e:
        return False, "", f"Malformed URL parsing error: {str(e)}"

    return True, url, ""
