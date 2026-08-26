import React from 'react';
import { Cpu, CheckCircle2, LineChart, Layers, HelpCircle } from 'lucide-react';

export default function BacktestInfo({ modelInfo }) {
  if (!modelInfo) return null;

  return (
    <div className="card" style={{ background: '#f8fafc' }}>
      <div className="card-header" style={{ borderColor: '#cbd5e1' }}>
        <div className="card-title">
          <Cpu size={18} color="#2563eb" />
          <span>ML Model Architecture & Methodology</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Source: Prediction.ipynb</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MODEL TYPE</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
            {modelInfo.model_type}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.1rem' }}>
            n_estimators={modelInfo.n_estimators}, min_samples_split={modelInfo.min_samples_split}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PREDICTORS (EXACT ORDER)</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
            Close → High → Low → Open → Volume
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.1rem' }}>
            5 OHLCV features extracted from Yahoo Finance
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>WALK-FORWARD BACKTEST SCORE</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
            {(modelInfo.backtest_precision * 100).toFixed(2)}% Precision
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.1rem' }}>
            Evaluated using expanding historical walk-forward windows
          </div>
        </div>
      </div>
    </div>
  );
}
