const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Centralized API Service for interacting with FastAPI backend
 */

export async function fetchCompanies(search = '') {
  try {
    const url = new URL(`${API_BASE_URL}/api/companies`);
    if (search) {
      url.searchParams.append('search', search);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error in fetchCompanies:', error);
    throw error;
  }
}

export async function fetchMarketData(symbol) {
  try {
    const url = new URL(`${API_BASE_URL}/api/market-data`);
    url.searchParams.append('symbol', symbol);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Failed to fetch market data for ${symbol}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error in fetchMarketData (${symbol}):`, error);
    throw error;
  }
}

export async function predictStock(symbol, customFeatures = null) {
  try {
    const payload = {
      symbol: symbol.toUpperCase()
    };
    if (customFeatures) {
      payload.custom_features = customFeatures;
    }

    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (typeof errData.detail === 'object' && errData.detail.missing_fields) {
        const error = new Error(errData.detail.message || 'Market data incomplete.');
        error.missingFields = errData.detail.missing_fields;
        error.partialFeatures = errData.detail.partial_features;
        throw error;
      }
      throw new Error(typeof errData.detail === 'string' ? errData.detail : 'Prediction failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error in predictStock (${symbol}):`, error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
