import React, { useEffect, useRef } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function PredictionCard({
  prediction,
  loading,
  onPredict,
  hasMissingData,
  symbol
}) {
  const resultRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (prediction && resultRef.current) {
      // GSAP Entrance animation
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' }
      );

      // GSAP Counter animation for confidence percentage
      if (countRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: prediction.confidence_percent,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.innerText = `${obj.val.toFixed(1)}%`;
            }
          }
        });
      }
    }
  }, [prediction]);

  return (
    <div className="card">
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn-primary"
          onClick={onPredict}
          disabled={loading || hasMissingData}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Running RandomForest ML Model...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Predict Next Day Direction for {symbol}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {prediction && (
        <div
          ref={resultRef}
          className={`prediction-display-card card ${
            prediction.prediction_class === 1 ? 'bullish' : 'bearish'
          }`}
          style={{ marginBottom: 0 }}
        >
          <div className="prediction-header">
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Machine Learning Next-Day Forecast
              </div>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
                Next Trading Day Horizon
              </h3>
            </div>

            <div className={`direction-badge ${prediction.prediction_class === 1 ? 'bullish' : 'bearish'}`}>
              {prediction.prediction_class === 1 ? (
                <>
                  <TrendingUp size={22} />
                  <span>Bullish ▲</span>
                </>
              ) : (
                <>
                  <TrendingDown size={22} />
                  <span>Bearish ▼</span>
                </>
              )}
            </div>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Model Movement Probability
            </div>
            <div className="probability-counter">
              <span ref={countRef}>{prediction.confidence_percent}%</span>
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>
                {prediction.predicted_direction === 'UP' ? 'Probability of Higher Close' : 'Probability of Lower Close'}
              </span>
            </div>
          </div>

          <div className="target-range-box">
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Estimated Price Band ({prediction.currency})
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                {prediction.currency === 'INR' ? '₹' : '$'}{prediction.estimated_target_low} – {prediction.currency === 'INR' ? '₹' : '$'}{prediction.estimated_target_high}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>
              Base Price: <strong>{prediction.currency === 'INR' ? '₹' : '$'}{prediction.features.Close}</strong>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Model: <strong>RandomForestClassifier (100 Trees)</strong></span>
            <span>Backtest Precision: <strong>{(prediction.model_info.backtest_precision * 100).toFixed(2)}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
