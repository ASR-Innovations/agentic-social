'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/performance';

export function Hero() {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [email, setEmail] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setShouldAnimate(!prefersReducedMotion());
  }, []);

  const handleGetStarted = () => {
    if (email) {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/signup');
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-8 ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.1s' }}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-emerald-700 font-medium">Powered by 6 AI Agents</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 
          className={`text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6 ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          Social Media
          <br />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Reimagined with AI
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.3s' }}
        >
          Create, schedule, and analyze content across 9 platforms with intelligent automation that understands your brand.
        </p>

        {/* Email Input and Get Started */}
        <div 
          className={`flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-xl mx-auto ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full sm:min-w-[320px] px-6 py-4 h-14 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGetStarted()}
          />
          <Button
            onClick={handleGetStarted}
            className="w-full sm:w-auto group px-8 h-14 bg-gray-900 text-white rounded-full font-medium text-base transition-all hover:scale-105 hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
        
        {/* No credit card text */}
        <p 
          className={`text-sm text-gray-400 mt-4 ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.45s' }}
        >
          No credit card required • Free 14-day trial
        </p>

        {/* Trust indicators */}
        <div 
          className={`flex flex-wrap justify-center gap-8 mt-16 ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.5s' }}
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '9', label: 'Platforms' },
            { value: '6', label: 'AI Agents' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${shouldAnimate ? 'animate-bounce-slow' : ''}`}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-gray-400 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
