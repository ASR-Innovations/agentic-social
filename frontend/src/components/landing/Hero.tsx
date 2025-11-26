'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/performance';

export function Hero() {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setShouldAnimate(!prefersReducedMotion());
  }, []);

  const handleGetStarted = () => {
    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email && emailRegex.test(email);
    
    // Navigate to signup with email if valid, otherwise just navigate
    if (isValidEmail) {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/signup');
    }
  };

  const floatingIcons = [
    { Icon: Twitter, style: { top: '20%', left: '10%' } },
    { Icon: Facebook, style: { top: '30%', right: '15%' } },
    { Icon: Instagram, style: { top: '60%', left: '15%' } },
    { Icon: Linkedin, style: { top: '50%', right: '20%' } },
  ];

  return (
    <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 px-6 lg:px-12 bg-cream overflow-hidden">
      {/* Light grid/dot pattern background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #6B6F72 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating social icons - decorative */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        {floatingIcons.map(({ Icon, style }, index) => (
          <div
            key={index}
            className={`absolute w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center opacity-60 ${shouldAnimate ? 'animate-float' : ''}`}
            style={{
              ...style,
              animationDelay: shouldAnimate ? `${index * 0.5}s` : undefined,
            }}
          >
            <Icon className="w-6 h-6 text-text-muted" />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-8 md:space-y-12">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight tracking-tight">
            Your social media workspace
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-3xl mx-auto">
            Automate content creation, scheduling, and analytics with AI agents that understand your brand voice and audience.
          </p>

          {/* Search-like input + CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto pt-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGetStarted();
                  }
                }}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-brand-green focus:outline-none transition-colors bg-white text-text-primary"
              />
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-4 rounded-full shadow-buffer hover:shadow-buffer-lg transition-all hover:scale-105 whitespace-nowrap"
            >
              Get started for free
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="text-sm text-text-muted">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
