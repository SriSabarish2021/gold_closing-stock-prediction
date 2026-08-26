import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    print("Health check response:", response.json())
    assert response.status_code == 200

def test_companies():
    response = client.get("/api/companies")
    print(f"Companies response ({len(response.json())} items):", response.json()[:2])
    assert response.status_code == 200

def test_market_data():
    response = client.get("/api/market-data?symbol=INFY.NS")
    print("Market data response for INFY.NS:", response.json())
    assert response.status_code == 200

def test_predict_auto():
    payload = {"symbol": "INFY.NS"}
    response = client.post("/api/predict", json=payload)
    print("Predict response for INFY.NS:", response.json())
    assert response.status_code == 200

def test_predict_manual():
    payload = {
        "symbol": "INFY.NS",
        "custom_features": {
            "Close": 1512.40,
            "High": 1520.50,
            "Low": 1490.10,
            "Open": 1500.25,
            "Volume": 4500000.0
        }
    }
    response = client.post("/api/predict", json=payload)
    print("Predict response for manual custom features:", response.json())
    assert response.status_code == 200

if __name__ == "__main__":
    print("Running FastAPI backend tests...")
    test_health()
    test_companies()
    test_market_data()
    test_predict_auto()
    test_predict_manual()
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
