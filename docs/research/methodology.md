# Methodology

## 1. Dataset Ingestion & Partitioning

To evaluate model performance objectively without data leakage:
- Raw URL corpora are cleaned to eliminate malformed protocols and duplicates.
- Stratified 3-way split: 70% Training ($N_{train} = 3,818$), 15% Validation ($N_{val} = 818$), 15% Holdout Test ($N_{test} = 819$).
- Normalization maps labels strictly to binary values: $y \in \{0, 1\}$ (where 0 denotes Legitimate and 1 denotes Phishing).

## 2. Leakage-Free Preprocessing

All preprocessing parameters are derived strictly from the training partition:
$$\hat{\mu}_{train}, \hat{\sigma}_{train} \leftarrow \text{Fit}(X_{train})$$
$$X_{val} \leftarrow \text{Transform}(X_{val}; \hat{\mu}_{train}, \hat{\sigma}_{train})$$
$$X_{test} \leftarrow \text{Transform}(X_{test}; \hat{\mu}_{train}, \hat{\sigma}_{train})$$

- **Imputation:** Median replacement for any missing numerical features.
- **Variance Thresholding:** Drops near-zero variance features that provide no discriminatory power across samples.
- **Robust Scaling:** Scales features using median and interquartile range (IQR) to prevent outlier degradation.

## 3. Cross-Validation Framework

5-Fold Stratified Cross-Validation was conducted across all baseline algorithms to ensure generalizability and quantify variance.
