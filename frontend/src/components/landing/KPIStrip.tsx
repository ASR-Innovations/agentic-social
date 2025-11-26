'use client';

import { useEffect, useRef, useState } from 'react';
import { KPICardProps } from '@/lib/landing-types';
import { prefersReducedMotion } from '@/lib/performance';

function KPICard({ value, label, animateOnView = true }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(animateOnView ? 0 : value);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animateOnView) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [animateOnView, isVisible]);

  useEffect(() => {
    if (!isVisible || !animateOnView) return;

    const numericValue = typeof value === 'string' 
      ? parseInt(value.replace(/[^0-9]/g, '')) 
      : value;

    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const suffix = typeof value === 'string' ? value.replace(/[0-9]/g, '') : '';
        setDisplayValue(Math.floor(current) + suffix);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value, animateOnView]);

  return (
    <div
      ref={cardRef}
      data-testid="kpi-card"
      className="bg-white rounded-full px-8 py-6 shadow-buffer hover:shadow-buffer-lg transition-all"
    >
      <div className="text-center space-y-2">
        <div className="text-4xl md:text-5xl font-bold text-brand-green">
          {displayValue}
        </div>
        <div className="text-sm font-medium text-text-muted uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

export function KPIStrip({ kpis }: { kpis: KPICardProps[] }) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    setShouldAnimate(!prefersReducedMotion());
  }, []);

  return (
    <section className="py-16 px-6 lg:px-12 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              style={{
                opacity: 1,
                transform: 'translate(0, 0)',
                animation: shouldAnimate ? `fadeInUp 600ms ease-out ${index * 150}ms backwards` : 'none',
              }}
            >
              <KPICard {...kpi} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
