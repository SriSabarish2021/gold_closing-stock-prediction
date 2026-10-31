# StockPulse ML — Next-Day Stock Market Prediction Web Application

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify)](https://netlify.com/)

A production-grade full-stack ML web application that predicts the **next trading day's stock price movement direction** (Bullish ▲ / Bearish ▼) using a scikit-learn `RandomForestClassifier` and live Yahoo Finance market data.

---

## Architecture

```
React + Vite  →  FastAPI Backend  →  scikit-learn Model  →  Yahoo Finance (yfinance)
 (Netlify)         (Render.com)        (trained_model.joblib)
```

---

## Machine Learning Model

Exact pipeline from `Prediction.ipynb`:

| Property | Value |
|---|---|
| **Model** | `RandomForestClassifier` |
| **Hyperparameters** | `n_estimators=100, min_samples_split=100, random_state=1` |
| **Predictors (exact order)** | `Close → High → Low → Open → Volume` |
| **Target** | `1` if next-day Close > today Close, else `0` |
| **Validation** | Walk-forward expanding backtesting |
| **Backtest Precision** | ~51.05% over 4,110 trading records |

---

## Project Structure

```
PROJ-11--ML/
├── netlify.toml              ← Root Netlify build config (points to frontend/)
├── render.yaml               ← Render.com deployment blueprint (backend)
├── .gitignore
├── README.md
├── Prediction.ipynb          ← Original ML notebook (source of truth)
├── infosys_data.csv          ← Historical OHLCV training data
│
├── backend/
│   ├── app/
│   │   ├── main.py           ← FastAPI entry point (CORS via env var)
│   │   ├── routes/
│   │   │   ├── companies.py  ← GET /api/companies
│   │   │   └── predict.py    ← GET /api/market-data  POST /api/predict
│   │   ├── services/
│   │   │   ├── ml_service.py ← Loads model, runs inference
│   │   │   └── yahoo_finance.py ← yfinance data fetcher
│   │   └── schemas/
│   │       └── predict_schema.py ← Pydantic models
│   ├── model/
│   │   ├── train_model.py    ← Reproduces notebook pipeline & saves model
│   │   ├── trained_model.joblib ← Serialized production model (~1.4 MB)
│   │   └── model_metadata.json
│   ├── Procfile              ← For Render / Heroku / Railway
│   ├── runtime.txt           ← Python 3.11
│   └── requirements.txt
│
└── frontend/
    ├── netlify.toml          ← Frontend-only Netlify config
    ├── .env.example          ← Template — copy to .env
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/       ← Navbar, Hero, CompanySelector, MarketData, PredictionCard, etc.
    │   ├── services/api.js   ← All API calls (reads VITE_API_URL)
    │   └── styles/index.css  ← Vanilla CSS design system
    ├── package.json
    └── vite.config.js
```

---

## Local Development Setup

### 1 — Backend (FastAPI + ML)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Retrain the model from scratch
python model/train_model.py

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API available at: **http://127.0.0.1:8000**  
Swagger docs: **http://127.0.0.1:8000/docs**

### 2 — Frontend (React + Vite)

```bash
cd frontend

# Copy environment template
cp .env.example .env
# (Default VITE_API_URL=http://localhost:8000 is fine for local dev)

# Install dependencies
npm install

# Start Vite dev server on port 600
npm run dev
```

App available at: **http://localhost:600**

---

## API Reference

### `GET /api/health`
```json
{ "status": "healthy", "model": "RandomForestClassifier" }
```

### `GET /api/companies?search=INFY`
Returns list of supported ticker symbols and metadata.

### `GET /api/market-data?symbol=INFY.NS`
Returns latest OHLCV features from Yahoo Finance.  
`has_missing: true` + `missing_fields: [...]` when data is unavailable.

### `POST /api/predict`
```json
// Request
{ "symbol": "INFY.NS" }

// Or with manual features:
{
  "symbol": "INFY.NS",
  "custom_features": {
    "Close": 1512.40, "High": 1520.50, "Low": 1490.10,
    "Open": 1500.25, "Volume": 4500000.0
  }
}

// Response
{
  "symbol": "INFY.NS",
  "company_name": "Infosys Limited",
  "currency": "INR",
  "prediction_class": 1,
  "predicted_direction": "UP",
  "predicted_label": "Bullish ▲",
  "probability_up": 0.58,
  "confidence_percent": 58.0,
  "estimated_target_low": 1524.56,
  "estimated_target_high": 1548.88,
  "model_info": {
    "model_type": "RandomForestClassifier",
    "backtest_precision": 0.5105,
    "predictors": ["Close", "High", "Low", "Open", "Volume"]
  }
}
```

---

## Deployment Guide

### Step 1 — Push to GitHub

```bash
# At the repo root (PROJ-11--ML/)
git init                          # skip if already initialized
git add .
git commit -m "feat: production-ready StockPulse ML application"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### Step 2 — Deploy Backend to Render (free)

1. Go to [https://render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   | Field | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
4. Under **Environment Variables**, add:
   - `ALLOWED_ORIGINS` = `https://your-app.netlify.app` *(fill in after step 3)*
5. Deploy → Copy the URL: `https://stockpulse-ml-backend.onrender.com`

> **Tip**: Render's free tier spins down after inactivity. The first request may take ~30s to wake up.

---

### Step 3 — Deploy Frontend to Netlify

**Option A — Netlify UI (recommended)**

1. Go to [https://app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
2. Select your GitHub repo
3. Build settings (auto-detected from root `netlify.toml`):
   | Field | Value |
   |---|---|
   | **Base directory** | `frontend` |
   | **Build command** | `npm install && npm run build` |
   | **Publish directory** | `frontend/dist` |
4. Under **Site configuration → Environment variables**, add:
   - `VITE_API_URL` = `https://stockpulse-ml-backend.onrender.com` *(your Render URL)*
5. Deploy site → Visit your Netlify URL 🎉

**Option B — Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
cd frontend
netlify deploy --build --prod
```

---

### Step 4 — Update CORS on Render

After your Netlify URL is assigned (e.g. `https://your-app.netlify.app`):

- In Render → Environment Variables:
  - `ALLOWED_ORIGINS` = `https://your-app.netlify.app,http://localhost:600`
- Render will redeploy automatically.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | FastAPI backend base URL | `https://your-backend.onrender.com` |

### Backend (Render environment)

| Variable | Description | Example |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `https://your-app.netlify.app` |

---

## ⚠ Financial Disclaimer

This application is built for **educational and analytical demonstration purposes only**.

Predictions are generated by a machine learning model trained on historical stock market data. They are **NOT guaranteed to be accurate** and should **NEVER be considered financial or investment advice**. Always consult a licensed financial advisor before making investment decisions.
