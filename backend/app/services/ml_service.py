import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "model"))
MODEL_PATH = os.path.join(MODEL_DIR, "trained_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

# Notebook feature order: Close, High, Low, Open, Volume
FEATURE_ORDER = ["Close", "High", "Low", "Open", "Volume"]

class MLPredictionService:
    def __init__(self):
        self.model = None
        self.metadata = {}
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print(f"Loaded ML model successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"Error loading trained_model.joblib: {e}")
        else:
            print(f"Warning: {MODEL_PATH} not found. Please run train_model.py first.")

        if os.path.exists(METADATA_PATH):
            try:
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"Error loading model_metadata.json: {e}")
        else:
            self.metadata = {
                "model_type": "RandomForestClassifier",
                "n_estimators": 100,
                "min_samples_split": 100,
                "backtest_precision": 0.5105,
                "predictors": FEATURE_ORDER
            }

    def predict(self, features: Dict[str, float]) -> Tuple[int, float, float, float, float]:
        """
        Takes dictionary with keys Close, High, Low, Open, Volume.
        Returns:
            (pred_class, proba_up, proba_down, target_low, target_high)
        """
        if self.model is None:
            self._load_model()
            if self.model is None:
                raise RuntimeError("ML model is not loaded.")

        # Construct input array in exact feature ordering from Notebook Cell 349/357
        input_data = [
            float(features["Close"]),
            float(features["High"]),
            float(features["Low"]),
            float(features["Open"]),
            float(features["Volume"])
        ]

        X = pd.DataFrame([input_data], columns=FEATURE_ORDER)
        
        pred_class = int(self.model.predict(X)[0])
        
        if hasattr(self.model, "predict_proba"):
            proba = self.model.predict_proba(X)[0]
            # Classes are typically [0, 1]
            proba_down = float(proba[0])
            proba_up = float(proba[1]) if len(proba) > 1 else (1.0 - proba_down)
        else:
            proba_up = 1.0 if pred_class == 1 else 0.0
            proba_down = 1.0 - proba_up

        current_close = float(features["Close"])
        # Estimate expected next-day target range based on historical volatility (e.g. High-Low spread)
        price_spread = abs(float(features["High"]) - float(features["Low"]))
        expected_delta = price_spread * 0.4 if price_spread > 0 else current_close * 0.01

        if pred_class == 1: # Bullish UP
            target_low = current_close + (expected_delta * 0.3)
            target_high = current_close + (expected_delta * 1.2)
        else: # Bearish DOWN
            target_low = max(0.1, current_close - (expected_delta * 1.2))
            target_high = current_close - (expected_delta * 0.3)

        return pred_class, proba_up, proba_down, round(target_low, 2), round(target_high, 2)

ml_service = MLPredictionService()
