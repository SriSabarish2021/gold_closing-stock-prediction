import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CompanySelector from './components/CompanySelector';
import MarketData from './components/MarketData';
import PredictionCard from './components/PredictionCard';
import WarningCard from './components/WarningCard';
import BacktestInfo from './components/BacktestInfo';
import Footer from './components/Footer';
import { fetchMarketData, predictStock, checkHealth } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('INFY.NS');
  const [marketData, setMarketData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Check Backend connection health
  useEffect(() => {
    const verifyBackend = async () => {
      const healthy = await checkHealth();
      setIsBackendConnected(healthy);
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch market data whenever selectedSymbol changes
  useEffect(() => {
    if (!selectedSymbol) return;

    const loadData = async () => {
      setLoadingMarket(true);
      setErrorMsg(null);
      setPrediction(null);
      try {
        const data = await fetchMarketData(selectedSymbol);
        setMarketData(data);
      } catch (err) {
        console.error('Failed to load market data:', err);
        setErrorMsg(err.message || `Could not fetch Yahoo Finance data for ${selectedSymbol}. You can enter values manually below.`);
        // Initialize blank market data for manual input
        setMarketData({
          symbol: selectedSymbol,
          company_name: selectedSymbol,
          currency: selectedSymbol.endsWith('.NS') ? 'INR' : 'USD',
          timestamp: new Date().toISOString().slice(0, 10),
          data_source: 'Manual Fallback',
          features: { Close: 1500, High: 1520, Low: 1490, Open: 1505, Volume: 5000000 },
          has_missing: true,
          missing_fields: ['Close', 'High', 'Low', 'Open', 'Volume']
        });
      } finally {
        setLoadingMarket(false);
      }
    };

    loadData();
  }, [selectedSymbol]);

  // Handle Feature Manual Edits
  const handleFeatureChange = (key, val) => {
    if (!marketData) return;
    const updatedFeatures = { ...marketData.features, [key]: val };
    const missing = Object.keys(updatedFeatures).filter(
      (k) => updatedFeatures[k] === null || updatedFeatures[k] === undefined || isNaN(updatedFeatures[k])
    );
    setMarketData({
      ...marketData,
      features: updatedFeatures,
      has_missing: missing.length > 0,
      missing_fields: missing
    });
  };

  // Run ML Prediction
  const handleRunPrediction = async () => {
    if (!selectedSymbol) return;
    setLoadingPredict(true);
    setErrorMsg(null);

    try {
      // Determine if we should send custom features
      const isManual = marketData.data_source.includes('Manual') || marketData.has_missing;
      const customFeatures = isManual ? marketData.features : null;

      const res = await predictStock(selectedSymbol, customFeatures);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
      if (err.missingFields) {
        setErrorMsg(`Market data for ${selectedSymbol} is incomplete. Missing: ${err.missingFields.join(', ')}. Please fill them in manual mode.`);
      } else {
        setErrorMsg(err.message || 'We could not generate the prediction. Please check backend connection and retry.');
      }
    } finally {
      setLoadingPredict(false);
    }
  };

  const hasMissingData = marketData
    ? Object.values(marketData.features).some((v) => v === null || v === undefined || isNaN(v))
    : true;

  return (
    <div className="app-container">
      <Navbar isBackendConnected={isBackendConnected} />

      <Hero />

      <CompanySelector
        selectedSymbol={selectedSymbol}
        onSelectCompany={(comp) => setSelectedSymbol(comp.symbol)}
      />

      {errorMsg && (
        <div className="warning-banner" style={{ background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9rem' }}>Market Data Notice</div>
            <div style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      <MarketData
        marketData={marketData}
        loading={loadingMarket}
        onFeatureChange={handleFeatureChange}
      />

      <PredictionCard
        prediction={prediction}
        loading={loadingPredict}
        onPredict={handleRunPrediction}
        hasMissingData={hasMissingData}
        symbol={selectedSymbol}
      />

      <WarningCard />

      <BacktestInfo modelInfo={prediction?.model_info} />

      <Footer />
    </div>
  );
}
