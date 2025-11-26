'use client';

import { MiniFeatureCardProps } from '@/lib/landing-types';

function MiniFeatureCard({ icon, title }: MiniFeatureCardProps) {
  return (
    <div
      data-testid="mini-feature-card"
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
    </div>
  );
}

export function FeatureGallery({ features }: { features: MiniFeatureCardProps[] }) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-8">
          ...and so much more!
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <MiniFeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
