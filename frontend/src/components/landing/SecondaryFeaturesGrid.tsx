'use client';

import { FeatureTileProps } from '@/lib/landing-types';
import Image from 'next/image';

function FeatureTile({ title, description, screenshot, backgroundColor }: FeatureTileProps) {
  return (
    <div
      data-testid="feature-tile"
      className="rounded-xl p-6 shadow-buffer hover:shadow-buffer-lg hover:-translate-y-1 transition-all duration-150 ease-in-out"
      style={{ backgroundColor }}
    >
      {/* Screenshot */}
      <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
          {screenshot ? (
            <Image
              src={screenshot}
              alt={title}
              width={400}
              height={300}
              className="rounded object-cover"
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            />
          ) : (
            <span className="text-text-muted text-xs">Screenshot</span>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

export function SecondaryFeaturesGrid({ features }: { features: FeatureTileProps[] }) {
  return (
    <section className="py-20 px-6 lg:px-12 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureTile key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
