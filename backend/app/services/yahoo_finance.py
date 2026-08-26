import yfinance as yf
import pandas as pd
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

COMPANY_DATABASE = [
    {"symbol": "INFY.NS", "name": "Infosys Limited", "exchange": "NSE", "currency": "INR", "sector": "Information Technology"},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE", "currency": "INR", "sector": "Energy & Retail"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE", "currency": "INR", "sector": "Information Technology"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Limited", "exchange": "NSE", "currency": "INR", "sector": "Banking & Financials"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Limited", "exchange": "NSE", "currency": "INR", "sector": "Banking & Financials"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE", "currency": "NSE", "currency": "INR", "sector": "Banking & Financials"},
    {"symbol": "ITC.NS", "name": "ITC Limited", "exchange": "NSE", "currency": "INR", "sector": "Consumer Goods"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd", "exchange": "NSE", "currency": "INR", "sector": "Engineering & Construction"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Limited", "exchange": "NSE", "currency": "INR", "sector": "Telecom"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Limited", "exchange": "NSE", "currency": "INR", "sector": "Automotive"},
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Alphabet Inc. (Google)", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ", "currency": "USD", "sector": "Semiconductors"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "currency": "USD", "sector": "E-Commerce & Cloud"}
]

def get_supported_companies(query: Optional[str] = None) -> List[Dict[str, Any]]:
    if not query:
        return COMPANY_DATABASE
    
    q = query.lower().strip()
    return [
        c for c in COMPANY_DATABASE
        if q in c["symbol"].lower() or q in c["name"].lower() or q in c["exchange"].lower()
    ]

def fetch_latest_market_data(symbol: str) -> Dict[str, Any]:
    """
    Downloads latest OHLCV data for given ticker using yfinance.
    Detects missing fields and returns structured response.
    """
    company_info = next((c for c in COMPANY_DATABASE if c["symbol"].upper() == symbol.upper()), None)
    company_name = company_info["name"] if company_info else symbol.upper()
    currency = company_info["currency"] if company_info else ("INR" if ".NS" in symbol.upper() or ".BO" in symbol.upper() else "USD")

    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1mo", interval="1d")

        if df.empty or len(df) == 0:
            return {
                "symbol": symbol.upper(),
                "company_name": company_name,
                "currency": currency,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "data_source": "Yahoo Finance (Fallback Mode)",
                "features": {
                    "Close": None,
                    "High": None,
                    "Low": None,
                    "Open": None,
                    "Volume": None
                },
                "has_missing": True,
                "missing_fields": ["Close", "High", "Low", "Open", "Volume"]
            }

        latest_row = df.iloc[-1]

        # Extract features with null check
        features = {}
        missing_fields = []
        for col in ["Close", "High", "Low", "Open", "Volume"]:
            val = latest_row.get(col, None)
            if val is None or pd.isna(val) or math.isnan(float(val)):
                features[col] = None
                missing_fields.append(col)
            else:
                features[col] = float(round(val, 2) if col != "Volume" else int(val))

        timestamp = latest_row.name.strftime("%Y-%m-%d") if hasattr(latest_row.name, "strftime") else str(latest_row.name)[:10]

        return {
            "symbol": symbol.upper(),
            "company_name": company_name,
            "currency": currency,
            "timestamp": timestamp,
            "data_source": "Yahoo Finance",
            "features": features,
            "has_missing": len(missing_fields) > 0,
            "missing_fields": missing_fields
        }
    except Exception as e:
        print(f"Error fetching yfinance data for {symbol}: {e}")
        return {
            "symbol": symbol.upper(),
            "company_name": company_name,
            "currency": currency,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "data_source": "Yahoo Finance (Error)",
            "features": {
                "Close": None,
                "High": None,
                "Low": None,
                "Open": None,
                "Volume": None
            },
            "has_missing": True,
            "missing_fields": ["Close", "High", "Low", "Open", "Volume"]
        }
