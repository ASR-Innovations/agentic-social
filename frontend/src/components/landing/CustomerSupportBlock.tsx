'use client';

import { Button } from '@/components/ui/button';
import { CustomerSupportBlockProps } from '@/lib/landing-types';
import { Headphones, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function CustomerSupportBlock({
  heading,
  description,
  ctaText,
  ctaLink,
  teamPhoto,
}: CustomerSupportBlockProps) {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-emerald-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <Headphones className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {heading}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                {description}
              </p>
              {ctaText && ctaLink && (
                <Button
                  onClick={() => (window.location.href = ctaLink)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full shadow-sm group"
                >
                  {ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>

            {/* Team Photo */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                {teamPhoto ? (
                  <Image
                    src={teamPhoto}
                    alt="Support team"
                    width={600}
                    height={400}
                    className="rounded-xl object-cover"
                    loading="lazy"
                    quality={85}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Team photo</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerSupportBlock;
