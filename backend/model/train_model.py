"""
Model Training Script for Stock Market Prediction
Replicates the ML pipeline from Prediction.ipynb:
- Model: RandomForestClassifier(min_samples_split=100, n_estimators=100, random_state=1)
- Predictors: ["Close", "High", "Low", "Open", "Volume"]
- Target: Binary next-day price movement (1 if Tomorrow Close > Today Close else 0)
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score

PREDICTORS = ["Close", "High", "Low", "Open", "Volume"]
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE_PATH = os.path.join(MODEL_DIR, "trained_model.joblib")
METADATA_FILE_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

def load_or_fetch_dataset():
    """
    Attempts to load local CSV dataset if present, otherwise downloads historical market data via yfinance.
    """
    workspace_root = os.path.abspath(os.path.join(MODEL_DIR, "..", ".."))
    infosys_csv = os.path.join(workspace_root, "infosys_data.csv")
    
    if os.path.exists(infosys_csv):
        print(f"Loading local dataset from {infosys_csv}...")
        df = pd.read_csv(infosys_csv)
        if "Price" in df.columns:
            df = df.drop(columns=["Price"])
        return df
    
    print("Local CSV not found. Fetching historical data via yfinance...")
    start_date = "2010-01-01"
    end_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    data = yf.download("INFY.NS", start=start_date, end=end_date, interval="1d")
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)
        
    data = data.reset_index()
    # Keep standard columns
    keep_cols = [col for col in ["Close", "High", "Low", "Open", "Volume"] if col in data.columns]
    df = data[keep_cols].copy()
    return df

def preprocess_and_train():
    print("Starting ML Pipeline Training...")
    rawdata = load_or_fetch_dataset()
    
    # Clean and format columns
    for col in PREDICTORS:
        rawdata[col] = pd.to_numeric(rawdata[col], errors="coerce")
    rawdata = rawdata.dropna(subset=PREDICTORS).copy()
    
    # Feature engineering as defined in notebook
    rawdata["Tomorrow"] = rawdata["Close"].shift(-1)
    rawdata["Target"] = (rawdata["Tomorrow"] > rawdata["Close"]).astype("int32")
    
    # Drop last row since Tomorrow/Target will be NaN/invalid
    train_df = rawdata.dropna().copy()
    print(f"Dataset prepared with {len(train_df)} historical records.")
    
    # Exact Model definition from Notebook Cell 348
    rf_model = RandomForestClassifier(
        min_samples_split=100,
        n_estimators=100,
        random_state=1
    )
    
    # Walk-forward Backtesting function from Notebook Cell 351
    def predict_step(train_data, test_data, predictors, model):
        fitted = model.fit(train_data[predictors], train_data["Target"])
        y_pred = fitted.predict(test_data[predictors])
        predictions = pd.Series(y_pred, index=test_data.index, name="Prediction")
        return pd.concat([test_data["Target"], predictions], axis=1)

    def backtest(data, model, predictors, start_value=2500, step=250):
        all_predictions = []
        if len(data) <= start_value:
            start_value = int(len(data) * 0.6)
            step = max(50, int(len(data) * 0.1))
            
        for i in range(start_value, len(data), step):
            train_part = data.iloc[0:i].copy()
            test_part = data.iloc[i:(i+step)].copy()
            if len(test_part) == 0:
                continue
            pred = predict_step(train_part, test_part, predictors, model)
            all_predictions.append(pred)
            
        if not all_predictions:
            # Fallback simple split if dataset too small
            split_idx = int(len(data) * 0.8)
            return predict_step(data.iloc[0:split_idx], data.iloc[split_idx:], predictors, model)
            
        return pd.concat(all_predictions)

    print("Running walk-forward backtesting evaluation...")
    backtest_results = backtest(train_df, rf_model, PREDICTORS)
    precision = precision_score(backtest_results["Target"], backtest_results["Prediction"], zero_division=0)
    print(f"Backtest Precision Score: {precision:.4f} ({precision*100:.2f}%)")
    
    # Final production training on entire available historical dataset
    print("Fitting final production RandomForestClassifier model...")
    rf_model.fit(train_df[PREDICTORS], train_df["Target"])
    
    # Serialize model and metadata
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(rf_model, MODEL_FILE_PATH)
    print(f"Model saved to: {MODEL_FILE_PATH}")
    
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "min_samples_split": 100,
        "random_state": 1,
        "predictors": PREDICTORS,
        "target": "Next-Day Price Direction (1 = UP, 0 = DOWN)",
        "backtest_precision": float(round(precision, 4)),
        "train_samples": len(train_df),
        "trained_at": datetime.now().isoformat()
    }
    
    with open(METADATA_FILE_PATH, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {METADATA_FILE_PATH}")
    
    return rf_model, metadata

if __name__ == "__main__":
    preprocess_and_train()
