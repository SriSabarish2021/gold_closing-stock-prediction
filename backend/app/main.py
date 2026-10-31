import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import companies, predict

app = FastAPI(
    title="Stock Market Prediction ML API",
    description="REST API exposing scikit-learn RandomForestClassifier model for stock market prediction",
    version="1.0.0"
)

# CORS — allow all origins in dev; restrict to Netlify domain + localhost in production
# Set ALLOWED_ORIGINS env var on Render to your Netlify URL, e.g.:
#   ALLOWED_ORIGINS=https://your-app.netlify.app,http://localhost:600
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
if _raw_origins.strip() == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(companies.router)
app.include_router(predict.router)

@app.get("/")
def root():
    return {
        "message": "Stock Market Prediction API is running",
        "docs": "/docs",
        "health": "OK"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model": "RandomForestClassifier",
        "service": "Stock Analytics ML Service"
    }
