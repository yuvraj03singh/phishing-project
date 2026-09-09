"""
Dataset Ingestion, Schema Validation, Deduplication, and Stratified Partitioning.
Guarantees clean, leakage-free datasets for training, validation, and testing.
"""

import sys
import logging
from pathlib import Path
from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def standardize_schema(df: pd.DataFrame) -> pd.DataFrame:
    """Detect and standardize URL and label columns across common dataset formats."""
    df = df.copy()
    url_candidates = ["url", "URL", "urls", "domain", "Domain", "webpage", "link"]
    label_candidates = ["label", "Label", "CLASS", "class", "target", "Target", "result", "Result", "status", "Status", "type", "Type"]

    url_col = None
    for cand in url_candidates:
        if cand in df.columns:
            url_col = cand
            break

    label_col = None
    for cand in label_candidates:
        if cand in df.columns:
            label_col = cand
            break

    if not url_col or not label_col:
        raise ValueError(
            f"Dataset must contain URL and label columns. Found columns: {list(df.columns)}"
        )

    df = df[[url_col, label_col]].rename(columns={url_col: "url", label_col: "label"})

    # Normalize labels: 0 = legitimate/good/benign, 1 = phishing/bad/malicious
    if df["label"].dtype == object or isinstance(df["label"].iloc[0], str):
        label_map = {
            "legitimate": 0, "benign": 0, "good": 0, "0": 0, "safe": 0, "ham": 0,
            "phishing": 1, "bad": 1, "malicious": 1, "1": 1, "spam": 1, "fraud": 1
        }
        df["label"] = df["label"].astype(str).str.strip().str.lower().map(label_map)
    else:
        df["label"] = df["label"].astype(int)

    # Filter out any unmapped labels
    df = df.dropna(subset=["label"])
    df["label"] = df["label"].astype(int)
    return df


def clean_and_validate_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Remove nulls, empty strings, duplicates, and malformed records."""
    initial_count = len(df)
    logger.info("Initial record count: %d", initial_count)

    # Standardize column schema
    df = standardize_schema(df)

    # Clean URL strings
    df["url"] = df["url"].astype(str).str.strip()
    df = df[df["url"].str.len() > 3]
    df = df[df["url"].str.len() <= 2048]

    # Drop missing values
    df = df.dropna(subset=["url", "label"])

    # Deduplicate exact URLs
    exact_duplicates = df.duplicated(subset=["url"]).sum()
    if exact_duplicates > 0:
        logger.info("Found and removed %d duplicate URLs", exact_duplicates)
        df = df.drop_duplicates(subset=["url"])

    # Summary of classes
    counts = df["label"].value_counts().to_dict()
    legit_count = counts.get(0, 0)
    phish_count = counts.get(1, 0)
    total = len(df)

    logger.info("Cleaned dataset: %d total (%d Legitimate [%.1f%%], %d Phishing [%.1f%%])",
                total, legit_count, (legit_count/total)*100 if total else 0,
                phish_count, (phish_count/total)*100 if total else 0)

    return df.reset_index(drop=True)


def stratified_split(
    df: pd.DataFrame,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Perform rigorous, stratified 3-way partition (Train, Val, Test).
    Zero overlap / leakage between sets.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"

    # Step 1: Split into Train and Temp (Val + Test)
    temp_ratio = val_ratio + test_ratio
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_ratio,
        stratify=df["label"],
        random_state=random_state
    )

    # Step 2: Split Temp into Val and Test
    val_share = val_ratio / temp_ratio
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1.0 - val_share),
        stratify=temp_df["label"],
        random_state=random_state
    )

    logger.info(
        "Stratified Split: Train=%d (%.1f%%), Val=%d (%.1f%%), Test=%d (%.1f%%)",
        len(train_df), (len(train_df)/len(df))*100,
        len(val_df), (len(val_df)/len(df))*100,
        len(test_df), (len(test_df)/len(df))*100
    )

    return train_df.reset_index(drop=True), val_df.reset_index(drop=True), test_df.reset_index(drop=True)
