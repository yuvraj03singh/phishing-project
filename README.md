# Phishing Detection System Through Hybrid ML Based on URL

[![CI/CD Pipeline](https://github.com/phishguard/phishing-detection-system/actions/workflows/ci.yml/badge.svg)](https://github.com/phishguard/phishing-detection-system/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-engineered, research-backed Cyber Threat Intelligence system that detects phishing URLs using a **Hybrid Machine Learning Ensemble** (Stacking Meta-Learner & Soft-Voting) combining Gradient Boosting, XGBoost, LightGBM, Extra Trees, and Random Forest models across **41 passive lexical and structural heuristics**.

---

## High-Level Architecture

```
                                  [ User / Client ]
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │   React 18 + Vite + Tailwind CSS    │
                       │   (Cyber Threat Intelligence UI)    │
                       └──────────────────┬──────────────────┘
                                          │ (HTTP Proxy / REST)
                                          ▼
                       ┌─────────────────────────────────────┐
                       │  Node.js + Express + TypeScript     │
                       │  (Security Gateway & JWT Auth)      │
                       └─────────┬─────────────────┬─────────┘
                                 │                 │
                (Audit & History)│                 │(Internal Microservice)
                                 ▼                 ▼
                       ┌──────────────────┐  ┌──────────────────────────────────┐
                       │  MongoDB Engine  │  │  FastAPI Inference Microservice  │
                       │  (Scan History)  │  │  (Sub-10ms Lexical Predictor)    │
                       └──────────────────┘  └────────────────┬─────────────────┘
                                                              │
                                                              ▼
                                             ┌──────────────────────────────────┐
                                             │ 41-Dimension Feature Extractor   │
                                             │ (Shannon Entropy, Lexical, RegEx)│
                                             └────────────────┬─────────────────┘
                                                              │
                                                              ▼
                                             ┌──────────────────────────────────┐
                                             │ Preprocessing Pipeline (Robust)  │
                                             └────────────────┬─────────────────┘
                                                              │
                                                              ▼
                                             ┌──────────────────────────────────┐
                                             │ Hybrid ML Stacking Meta-Learner  │
                                             │ (XGBoost + LightGBM + RF + LR)   │
                                             └──────────────────────────────────┘
```

---

## Key Features

- **Multi-Algorithm Benchmark:** Evaluates 9 candidate baseline algorithms (Logistic Regression, Decision Tree, Random Forest, Extra Trees, SVM, KNN, Gradient Boosting, XGBoost, LightGBM) via Stratified 5-Fold Cross-Validation.
- **Dual Hybrid Formulations:**
  - *Approach A (Soft Voting):* Weighted probability averaging combining top tree & boosting estimators.
  - *Approach B (2-Tier Stacking):* Cross-validated probability meta-features training an L2 regularized Logistic Regression meta-learner.
- **Strict Leakage-Free Pipeline:** 70% Train, 15% Validation, 15% Holdout Test splits. Preprocessing transformers fitted solely on training splits.
- **Explainable AI Indicators:** Defensible risk attribution breaking down why a URL triggered suspicion (e.g. IP address in hostname, Shannon entropy anomaly, deceptive subdomains, suspicious TLDs).
- **Safe Cybersecurity Boundary:** Purely passive lexical analysis with **zero server-side outbound network fetching**, completely eliminating Server-Side Request Forgery (SSRF) hazards.
- **Production REST Gateway:** Express/TypeScript API with Helmet headers, CORS, strict rate-limiting, Zod payload validation, Winston structured logging, and JWT authentication.
- **Modern React Dashboard:** Dark-mode cybersecurity UI with live URL scanner, batch CSV drag-and-drop scanner, Recharts threat telemetry, and paginated scan history audit logs.

---

## 41-Dimension Feature Registry

| Category | Extracted Dimensions |
| :--- | :--- |
| **Length & Ratios** | `url_length`, `hostname_length`, `path_length`, `query_length`, `fragment_length`, `domain_length`, `num_digits`, `num_letters`, `num_special_chars`, `digit_ratio`, `special_ratio` |
| **Character Counts** | `dot_count`, `hyphen_count`, `underscore_count`, `slash_count`, `question_mark_count`, `equal_count`, `at_count`, `ampersand_count`, `percent_count`, `colon_count`, `semicolon_count`, `comma_count`, `tilde_count`, `double_slash_count` |
| **Structural** | `num_subdomains`, `path_depth`, `num_query_params`, `has_prefix_suffix`, `hyphen_in_hostname`, `is_shortened` |
| **Cyber Security** | `has_ip_address` (IPv4/IPv6), `is_https`, `has_custom_port`, `has_at_symbol`, `has_suspicious_tld`, `has_suspicious_keyword`, `suspicious_keyword_count`, `is_encoded` |
| **Information Theory** | `url_entropy` (Shannon entropy), `hostname_entropy` |

---

## Empirical Benchmark Results

Evaluated on 5,455 authenticated URLs (2,655 Legitimate, 2,800 Phishing) using the 15% untouched Test partition ($N = 819$):

| Model Architecture | Accuracy | Precision | Recall | Specificity | F1-Score | ROC-AUC | FNR | Inference Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hybrid (Stacking Meta-Learner)** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **0.0000** | 0.280 ms |
| **Hybrid (Soft Voting)** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **0.0000** | 0.278 ms |
| **XGBoost Classifier** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.009 ms |
| **LightGBM Classifier** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.006 ms |
| **Gradient Boosting** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.003 ms |
| **Random Forest** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.092 ms |
| **Extra Trees** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.091 ms |
| **Logistic Regression** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.0000 | 0.001 ms |
| **Support Vector Machine** | 0.9988 | 1.0000 | 0.9976 | 1.0000 | 0.9988 | 1.0000 | 0.0024 | 0.023 ms |
| **K-Nearest Neighbors** | 0.9963 | 1.0000 | 0.9929 | 1.0000 | 0.9964 | 0.9988 | 0.0071 | 0.026 ms |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB (optional for standalone dev; Docker handles this automatically)

### 1. Run ML Training Pipeline
```bash
# Install Python ML dependencies
pip install -r ml-service/requirements.txt
pip install matplotlib pytest

# Execute full training, 5-fold CV, and artifact export
python ml-training/scripts/train.py
```

### 2. Start Services Locally

**Terminal 1 — FastAPI ML Engine:**
```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Node.js Express Gateway:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 — React Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Docker Compose Deployment

Run the complete multi-container stack with a single command:
```bash
docker-compose up --build
```
Services exposed:
- **Frontend Dashboard:** `http://localhost:3000`
- **Node.js Gateway:** `http://localhost:5000`
- **FastAPI ML Microservice:** `http://localhost:8000`
- **FastAPI Swagger / OpenAPI Docs:** `http://localhost:8000/docs`
- **MongoDB:** `localhost:27017`

---

## API Documentation

### ML Microservice (`http://localhost:8000`)
- `GET  /health` — Microservice health status & uptime
- `GET  /model-info` — Trained model metadata & parameters
- `GET  /features` — Complete 41-feature catalog
- `POST /predict` — Single URL risk evaluation
  ```json
  { "url": "https://secure-login.bank-update.xyz/auth" }
  ```
- `POST /predict/batch` — Bulk URL evaluation (up to 500 URLs)

### Backend API Gateway (`http://localhost:5000/api`)
- `POST /auth/register` — Analyst account registration
- `POST /auth/login` — Authentication & JWT issuance
- `GET  /auth/me` — Authenticated profile
- `POST /predictions` — Scan URL & save audit history
- `POST /predictions/batch` — Batch scan
- `GET  /predictions` — Query paginated history
- `DELETE /predictions/:id` — Delete scan record
- `GET  /dashboard/stats` — High-level telemetry aggregations
- `GET  /health` — Gateway & ML health check

---

## Testing

Run automated tests across all tiers:
```bash
# ML Feature Extractor & FastAPI tests
python -m pytest tests/ml/ -v

# Backend TypeScript build check
cd backend && npm run build

# Frontend TypeScript & Vite build check
cd frontend && npm run build
```

---

## Academic Citation & Research Docs

Detailed academic research documentation is located in [`docs/research/`](docs/research/):
- [`abstract.md`](docs/research/abstract.md)
- [`methodology.md`](docs/research/methodology.md)
- [`hybrid-model.md`](docs/research/hybrid-model.md)
- [`results.md`](docs/research/results.md)
- [`references.md`](docs/research/references.md)

---

## License
Distributed under the MIT License. Developed for defensive cybersecurity research.
