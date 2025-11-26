'use client';

import { Button } from '@/components/ui/button';
import { CustomerSupportBlockProps } from '@/lib/landing-types';
import Image from 'next/image';

export function CustomerSupportBlock({
  heading,
  description,
  ctaText,
  ctaLink,
  teamPhoto,
}: CustomerSupportBlockProps) {
  return (
    <section className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-pastel-blue rounded-3xl p-8 md:p-12 shadow-buffer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                {heading}
              </h2>
              <p className="text-lg text-text-muted leading-relaxed">
                {description}
              </p>
              {ctaText && ctaLink && (
                <Button
                  onClick={() => window.location.href = ctaLink}
                  className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3 rounded-full shadow-sm"
                >
                  {ctaText}
                </Button>
              )}
            </div>

            {/* Team Photo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {teamPhoto ? (
                  <Image
                    src={teamPhoto}
                    alt="Support team"
                    width={600}
                    height={400}
                    className="rounded-xl object-cover"
                    loading="lazy"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  />
                ) : (
                  <span className="text-text-muted text-sm">Team photo</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
