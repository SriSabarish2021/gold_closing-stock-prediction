import React, { useEffect, useRef } from 'react';
import { Sparkles, BarChart2 } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, []);

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-badge">
        <Sparkles size={14} />
        <span>Machine Learning Stock Analytics</span>
      </div>
      <h1 className="hero-title">
        Predict Next-Day Stock Market Direction with AI
      </h1>
      <p className="hero-subtitle">
        Select any company to extract historical OHLCV features and run our walk-forward evaluated scikit-learn Random Forest Classifier model.
      </p>
    </section>
  );
}
