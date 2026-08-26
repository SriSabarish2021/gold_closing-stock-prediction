from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class FeatureInput(BaseModel):
    Close: float = Field(..., description="Closing price")
    High: float = Field(..., description="Highest price")
    Low: float = Field(..., description="Lowest price")
    Open: float = Field(..., description="Opening price")
    Volume: float = Field(..., description="Trading volume")

class PredictRequest(BaseModel):
    symbol: str = Field(..., example="INFY.NS")
    custom_features: Optional[FeatureInput] = None

class CompanyItem(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str
    sector: Optional[str] = "Technology"

class MarketDataResponse(BaseModel):
    symbol: str
    company_name: str
    currency: str
    timestamp: str
    data_source: str
    features: Dict[str, float]
    has_missing: bool
    missing_fields: List[str]

class ModelMetadata(BaseModel):
    model_type: str
    n_estimators: int
    min_samples_split: int
    backtest_precision: float
    predictors: List[str]

class PredictResponse(BaseModel):
    symbol: str
    company_name: str
    currency: str
    timestamp: str
    data_source: str
    features: Dict[str, float]
    prediction_class: int  # 1 = UP (Bullish), 0 = DOWN (Bearish)
    predicted_direction: str  # "UP" or "DOWN"
    predicted_label: str  # "Bullish ▲" or "Bearish ▼"
    probability_up: float
    probability_down: float
    confidence_percent: float
    estimated_target_low: float
    estimated_target_high: float
    is_manual_input: bool
    model_info: ModelMetadata
