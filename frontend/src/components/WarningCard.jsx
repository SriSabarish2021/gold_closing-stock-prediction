import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function WarningCard() {
  return (
    <div className="warning-banner" style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
      <ShieldAlert size={26} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ⚠ MODEL-BASED ESTIMATE & FINANCIAL DISCLAIMER
        </div>
        <p style={{ fontSize: '0.88rem', color: '#b45309', lineHeight: 1.55 }}>
          This prediction is generated using historical stock market data and a machine learning model (RandomForestClassifier). 
          It is an algorithmic statistical estimate and is <strong>NOT guaranteed to be accurate</strong>. 
          This output should <strong>NEVER be considered financial or investment advice</strong>. Past stock market performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
