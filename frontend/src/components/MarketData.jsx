import React, { useState } from 'react';
import { Database, Edit2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MarketData({ marketData, loading, onFeatureChange, onResetData }) {
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
          <div className="spinner" style={{ borderColor: '#cbd5e1', borderTopColor: '#2563eb' }}></div>
          <span>Retrieving latest OHLCV market features from Yahoo Finance...</span>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  const { company_name, symbol, currency, timestamp, data_source, features, has_missing, missing_fields } = marketData;

  const handleInputChange = (field, val) => {
    const numVal = parseFloat(val);
    onFeatureChange(field, isNaN(numVal) ? 0 : numVal);
  };

  const fieldsOrder = [
    { key: 'Close', label: 'Close Price', format: (v) => `${currency === 'INR' ? '₹' : '$'}${v?.toFixed(2) || '0.00'}` },
    { key: 'High', label: 'High Price', format: (v) => `${currency === 'INR' ? '₹' : '$'}${v?.toFixed(2) || '0.00'}` },
    { key: 'Low', label: 'Low Price', format: (v) => `${currency === 'INR' ? '₹' : '$'}${v?.toFixed(2) || '0.00'}` },
    { key: 'Open', label: 'Open Price', format: (v) => `${currency === 'INR' ? '₹' : '$'}${v?.toFixed(2) || '0.00'}` },
    { key: 'Volume', label: 'Trading Volume', format: (v) => (v ? v.toLocaleString() : '0') }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={18} color="#059669" />
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
              {company_name} <span style={{ color: '#64748b', fontSize: '0.95rem' }}>({symbol})</span>
            </h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Source: <strong>{data_source}</strong> • Last Updated: <strong>{timestamp}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', width: 'auto' }}
            >
              Done Editing
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.85rem',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#475569',
                fontWeight: 600
              }}
            >
              <Edit2 size={13} />
              Manual Input / Edit
            </button>
          )}
        </div>
      </div>

      {has_missing && (
        <div className="warning-banner" style={{ marginTop: '0', marginBottom: '1rem', padding: '0.75rem 1rem' }}>
          <AlertTriangle className="warning-icon" size={18} />
          <div>
            <div className="warning-title" style={{ fontSize: '0.85rem' }}>
              Incomplete Yahoo Finance Data Detected
            </div>
            <div className="warning-text" style={{ fontSize: '0.8rem' }}>
              Some market indicators ({missing_fields.join(', ')}) were unavailable. Please enter them manually below before running prediction.
            </div>
          </div>
        </div>
      )}

      <div className="market-grid">
        {fieldsOrder.map(({ key, label, format }) => {
          const val = features[key];
          const isMissing = val === null || val === undefined;
          const isManual = isEditing || isMissing;

          return (
            <div key={key} className="market-item-card" style={{ borderColor: isMissing ? '#fde68a' : '#e2e8f0' }}>
              <div className="market-item-header">
                <span>{label}</span>
                <span className={`data-badge ${isManual ? 'manual' : 'auto'}`}>
                  {isManual ? 'Manual' : 'Auto-filled'}
                </span>
              </div>

              {isEditing || isMissing ? (
                <input
                  type="number"
                  step="any"
                  className="market-input-edit"
                  value={val ?? ''}
                  placeholder={`Enter ${key}`}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              ) : (
                <div className="market-item-value">{format(val)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
