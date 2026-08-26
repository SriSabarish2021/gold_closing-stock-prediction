import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';
import { fetchCompanies } from '../services/api';

export default function CompanySelector({ selectedSymbol, onSelectCompany }) {
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const data = await fetchCompanies(query);
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadCompanies();
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (comp) => {
    onSelectCompany(comp);
    setQuery('');
    setIsOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectCompany({
        symbol: query.trim().toUpperCase(),
        name: `${query.trim().toUpperCase()} Ticker`,
        exchange: 'Yahoo Finance',
        currency: query.trim().toUpperCase().endsWith('.NS') ? 'INR' : 'USD'
      });
      setIsOpen(false);
    }
  };

  const activeCompany = companies.find((c) => c.symbol === selectedSymbol);

  return (
    <div className="card selector-container" ref={dropdownRef}>
      <div className="card-header">
        <div className="card-title">
          <Building2 size={18} color="#2563eb" />
          <span>Select Company / Stock Ticker</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Yahoo Finance Compatible</span>
      </div>

      <form onSubmit={handleCustomSubmit} className="search-box-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or ticker (e.g. INFY.NS, RELIANCE.NS, AAPL)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </form>

      {isOpen && (
        <div className="dropdown-menu">
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              Loading tickers...
            </div>
          ) : companies.length > 0 ? (
            companies.map((comp) => (
              <div
                key={comp.symbol}
                className={`dropdown-item ${selectedSymbol === comp.symbol ? 'selected' : ''}`}
                onClick={() => handleSelect(comp)}
              >
                <div>
                  <div className="ticker-symbol">{comp.symbol}</div>
                  <div className="company-name-text">{comp.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="exchange-badge">{comp.exchange}</span>
                  {selectedSymbol === comp.symbol && <Check size={16} color="#059669" />}
                </div>
              </div>
            ))
          ) : (
            <div
              className="dropdown-item"
              onClick={() => handleCustomSubmit({ preventDefault: () => {} })}
              style={{ justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}
            >
              Analyze Custom Ticker "{query.toUpperCase()}" ↵
            </div>
          )}
        </div>
      )}
    </div>
  );
}
