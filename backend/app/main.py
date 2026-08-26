from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import companies, predict

app = FastAPI(
    title="Stock Market Prediction ML API",
    description="REST API exposing scikit-learn RandomForestClassifier model for stock market prediction",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
