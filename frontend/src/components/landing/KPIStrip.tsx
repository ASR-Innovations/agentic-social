'use client';

import { useEffect, useRef, useState } from 'react';
import { KPICardProps } from '@/lib/landing-types';
import { prefersReducedMotion } from '@/lib/performance';

function AnimatedNumber({ value, isVisible }: { value: string | number; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    
    const numericValue = typeof value === 'string' 
      ? parseInt(value.replace(/[^0-9]/g, '')) 
      : value;

    if (isNaN(numericValue) || prefersReducedMotion()) {
      setDisplayValue(String(value));
      hasAnimated.current = true;
      return;
    }

    const suffix = typeof value === 'string' ? value.replace(/[0-9]/g, '') : '';
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(String(value));
        clearInterval(timer);
        hasAnimated.current = true;
      } else {
        setDisplayValue(Math.floor(current) + suffix);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return <span>{displayValue}</span>;
}

function KPICard({ value, label, isVisible, index }: KPICardProps & { isVisible: boolean; index: number }) {
  return (
    <div
      data-testid="kpi-card"
      className="text-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
      }}
    >
      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
        <AnimatedNumber value={value} isVisible={isVisible} />
      </div>
      <div className="text-sm text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export function KPIStrip({ kpis }: { kpis: KPICardProps[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 px-6 lg:px-12 bg-white border-y border-gray-100"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {kpis.map((kpi, index) => (
            <KPICard 
              key={index} 
              {...kpi} 
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default KPIStrip;
