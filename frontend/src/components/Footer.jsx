import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#0f172a' }}>
        StockPulse ML • Next-Day Stock Market Prediction Web Application
      </div>
      <div>
        Powered by Python, FastAPI, scikit-learn RandomForestClassifier, yfinance, React, Vite, and GSAP.
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
        © {new Date().getFullYear()} StockPulse ML Analytics. All predictions are generated for educational and analytical demonstration purposes only.
      </div>
    </footer>
  );
}
