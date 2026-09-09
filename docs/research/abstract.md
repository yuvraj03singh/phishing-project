# Abstract

## Phishing Detection System Through Hybrid ML Based on URL

Phishing continues to present one of the most severe threat vectors in modern cybersecurity, serving as the initial compromise channel for ransomware deployment, corporate espionage, and credential harvesting. While signature-based blocklists and reactive domain reputation feeds mitigate known indicators of compromise (IoCs), they fundamentally fail against zero-hour, dynamically generated, and disposable attack domains.

In this research, we develop and evaluate an end-to-end, production-engineered **Hybrid Machine Learning Architecture** that identifies malicious URLs purely via passive lexical, structural, and information-theoretic (Shannon entropy) heuristics without performing external network lookups or introducing Server-Side Request Forgery (SSRF) vulnerabilities.

### Key Contributions
1. **Zero-Leakage Engineering Pipeline:** Stratified 70/15/15 data partitioning with preprocessing transformers strictly fitted on training splits, eliminating test-set information leakage.
2. **Comprehensive 41-Dimension Feature Registry:** Lexical extraction capturing structural nesting, character distributions, domain prefixes, Shannon entropy, and known cyber attack tokens.
3. **Multi-Algorithm Benchmark:** Systematic 5-fold cross-validation across 9 distinct baseline classifiers (Logistic Regression, Decision Trees, Random Forests, Extra Trees, SVM, KNN, Gradient Boosting, XGBoost, and LightGBM).
4. **Dual Hybrid Formulations:** Implementation of both a Soft-Voting Weighted Probability Ensemble and a 2-Tier Stacking Meta-Learner.
5. **Sub-Millisecond Inference & Explainability:** Integration into a high-throughput FastAPI engine delivering transparent risk factor attribution without dogmatic certainty claims.
