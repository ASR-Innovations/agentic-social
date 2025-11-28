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
    <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 px-6 lg:px-12 bg-bg-primary overflow-hidden">
      {/* Light grid/dot pattern background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-text-muted) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating social icons - decorative */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        {floatingIcons.map(({ Icon, style }, index) => (
          <div
            key={index}
            className={`absolute w-12 h-12 rounded-full bg-surface shadow-sm flex items-center justify-center opacity-60 ${shouldAnimate ? 'animate-float' : ''}`}
            style={{
              ...style,
              animationDelay: shouldAnimate ? `${index * 0.5}s` : undefined,
            }}
          >
            <Icon className="w-6 h-6 text-text-muted" />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8 md:space-y-10">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Your social media workspace
            </h1>

            {/* Tagline */}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Automate content creation, scheduling, and analytics with AI agents that understand your brand voice and audience.
            </p>

            {/* Search-like input + CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-brand-green focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400"
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
            <p className="text-sm text-gray-500">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Gradient overlay for better image integration */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=1000&fit=crop&q=90"
                alt="Social media dashboard interface showing analytics and content management"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
