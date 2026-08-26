from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.schemas.predict_schema import (
    PredictRequest, PredictResponse, MarketDataResponse, ModelMetadata, FeatureInput
)
from app.services.yahoo_finance import fetch_latest_market_data
from app.services.ml_service import ml_service, FEATURE_ORDER

router = APIRouter(prefix="/api", tags=["Prediction & Market Data"])

@router.get("/market-data", response_model=MarketDataResponse)
def get_market_data(symbol: str = Query(..., description="Stock ticker symbol (e.g. INFY.NS)")):
    if not symbol or not symbol.strip():
        raise HTTPException(status_code=400, detail="Stock ticker symbol is required.")
    
    market_data = fetch_latest_market_data(symbol.strip())
    return MarketDataResponse(
        symbol=market_data["symbol"],
        company_name=market_data["company_name"],
        currency=market_data["currency"],
        timestamp=market_data["timestamp"],
        data_source=market_data["data_source"],
        features=market_data["features"],
        has_missing=market_data["has_missing"],
        missing_fields=market_data["missing_fields"]
    )

@router.post("/predict", response_model=PredictResponse)
def predict_stock(payload: PredictRequest):
    symbol = payload.symbol.strip().upper()
    if not symbol:
        raise HTTPException(status_code=400, detail="Stock ticker symbol is required.")

    is_manual_input = False
    data_source = "Yahoo Finance"
    currency = "INR" if ".NS" in symbol or ".BO" in symbol else "USD"
    company_name = symbol

    if payload.custom_features:
        is_manual_input = True
        data_source = "User Provided / Manual Fallback"
        features_dict = {
            "Close": payload.custom_features.Close,
            "High": payload.custom_features.High,
            "Low": payload.custom_features.Low,
            "Open": payload.custom_features.Open,
            "Volume": payload.custom_features.Volume
        }
        # Try fetching company name if available
        fetched = fetch_latest_market_data(symbol)
        company_name = fetched.get("company_name", symbol)
        currency = fetched.get("currency", currency)
    else:
        fetched = fetch_latest_market_data(symbol)
        company_name = fetched["company_name"]
        currency = fetched["currency"]
        
        # Verify no missing fields
        missing = [k for k, v in fetched["features"].items() if v is None]
        if missing:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": f"Required market data fields missing from Yahoo Finance for ticker {symbol}: {', '.join(missing)}.",
                    "missing_fields": missing,
                    "partial_features": fetched["features"]
                }
            )
        features_dict = fetched["features"]

    # Run ML prediction model
    try:
        pred_class, proba_up, proba_down, target_low, target_high = ml_service.predict(features_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Model prediction failed: {str(e)}")

    predicted_direction = "UP" if pred_class == 1 else "DOWN"
    predicted_label = "Bullish ▲" if pred_class == 1 else "Bearish ▼"
    confidence_percent = round((proba_up if pred_class == 1 else proba_down) * 100.0, 2)

    model_metadata = ModelMetadata(
        model_type=ml_service.metadata.get("model_type", "RandomForestClassifier"),
        n_estimators=ml_service.metadata.get("n_estimators", 100),
        min_samples_split=ml_service.metadata.get("min_samples_split", 100),
        backtest_precision=float(ml_service.metadata.get("backtest_precision", 0.5105)),
        predictors=FEATURE_ORDER
    )

    return PredictResponse(
        symbol=symbol,
        company_name=company_name,
        currency=currency,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        data_source=data_source,
        features=features_dict,
        prediction_class=pred_class,
        predicted_direction=predicted_direction,
        predicted_label=predicted_label,
        probability_up=round(proba_up, 4),
        probability_down=round(proba_down, 4),
        confidence_percent=confidence_percent,
        estimated_target_low=target_low,
        estimated_target_high=target_high,
        is_manual_input=is_manual_input,
        model_info=model_metadata
    )
