'use client';

import { ArrowRight } from 'lucide-react';
import { FeatureCardProps } from '@/lib/landing-types';
import Image from 'next/image';
import { ScrollReveal } from './ScrollReveal';

function FeatureCard({ title, description, screenshot, backgroundColor, learnMoreLink }: FeatureCardProps) {
  const bgColors = {
    pink: 'bg-pastel-pink',
    lavender: 'bg-pastel-lavender',
    yellow: 'bg-pastel-yellow',
    blue: 'bg-pastel-blue',
  };

  const headerColors = {
    pink: 'bg-pink-100',
    lavender: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    blue: 'bg-blue-100',
  };

  return (
    <div
      data-testid="feature-card"
      className={`${bgColors[backgroundColor]} rounded-2xl p-8 shadow-buffer hover:shadow-buffer-lg hover:-translate-y-1.5 transition-all duration-150 ease-in-out group`}
    >
      {/* Tinted header */}
      <div className={`${headerColors[backgroundColor]} rounded-xl p-6 mb-6`}>
        <h3 className="text-2xl font-bold text-text-primary mb-3">{title}</h3>
        <p className="text-base text-text-muted leading-relaxed">{description}</p>
      </div>

      {/* Screenshot container */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          {screenshot ? (
            <Image
              src={screenshot}
              alt={title}
              width={600}
              height={400}
              className="rounded-lg object-cover"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
          ) : (
            <span className="text-text-muted text-sm">Screenshot placeholder</span>
          )}
        </div>
      </div>

      {/* Learn more link */}
      {learnMoreLink && (
        <a
          href={learnMoreLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-green hover:gap-3 transition-all"
        >
          Learn more
          <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

export function FeatureBlock({ features }: { features: FeatureCardProps[] }) {
  return (
    <section className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 200} direction="up">
              <FeatureCard {...feature} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
