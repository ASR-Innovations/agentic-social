'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CTABandProps } from '@/lib/landing-types';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';

export function CTABand({
  heading,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}: CTABandProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-32 px-6 lg:px-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-100/50 rounded-full blur-[150px]" />
      </div>

      <div
        className="max-w-3xl mx-auto text-center relative z-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {heading}
        </h2>

        {/* Subtext */}
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Join thousands of teams using AI to transform their social media
          presence.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.push(ctaLink)}
            className="group px-8 py-6 bg-gray-900 text-white rounded-full font-medium text-base hover:bg-gray-800 hover:scale-105 hover:shadow-xl transition-all"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {secondaryCtaText && secondaryCtaLink && (
            <Button
              variant="outline"
              onClick={() => router.push(secondaryCtaLink)}
              className="px-8 py-6 text-gray-700 hover:text-gray-900 rounded-full font-medium text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {secondaryCtaText}
            </Button>
          )}
        </div>

        {/* Trust text */}
        <p className="text-sm text-gray-400 mt-8">
          No credit card required • Free 14-day trial
        </p>
      </div>
    </section>
  );
}

export default CTABand;
