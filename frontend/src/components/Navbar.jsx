import React from 'react';
import { TrendingUp, Cpu, Activity } from 'lucide-react';

export default function Navbar({ isBackendConnected }) {
  return (
    <header className="navbar">
      <a href="#" className="nav-brand">
        <div className="brand-icon">
          <TrendingUp size={22} />
        </div>
        <span>StockPulse<span style={{ color: '#2563eb' }}>ML</span></span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="nav-status">
          <div className="status-dot" style={{ backgroundColor: isBackendConnected ? '#059669' : '#dc2626' }}></div>
          <span>{isBackendConnected ? 'FastAPI Backend Active' : 'Connecting to ML API...'}</span>
        </div>
        <div className="nav-status" style={{ background: '#f8fafc' }}>
          <Cpu size={14} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>RandomForest ML</span>
        </div>
      </div>
    </header>
  );
}
