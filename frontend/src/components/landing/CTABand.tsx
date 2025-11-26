'use client';

import { Button } from '@/components/ui/button';
import { CTABandProps } from '@/lib/landing-types';
import { useRouter } from 'next/navigation';
import { ScrollReveal } from './ScrollReveal';

export function CTABand({ heading, ctaText, ctaLink }: CTABandProps) {
  const router = useRouter();

  return (
    <section id="pricing" className="py-20 px-6 lg:px-12 bg-pastel-mint">
      <ScrollReveal direction="fade" duration={800}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
            {heading}
          </h2>
          <Button
            onClick={() => router.push(ctaLink)}
            className="bg-brand-green hover:bg-brand-green/90 text-white px-10 py-6 text-lg rounded-full shadow-buffer hover:shadow-buffer-lg hover:scale-105 transition-all"
          >
            {ctaText}
          </Button>
          <p className="text-sm text-text-muted">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
