'use client';

import { PlatformIconProps } from '@/lib/landing-types';
import { ScrollReveal } from './ScrollReveal';

function PlatformIcon({ platform, icon }: PlatformIconProps) {
  return (
    <div
      data-testid="platform-icon"
      className="bg-white rounded-2xl p-6 shadow-buffer hover:shadow-buffer-lg hover:scale-105 transition-all duration-150 ease-in-out"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-medium text-text-primary">{platform}</span>
      </div>
    </div>
  );
}

export function PlatformGrid({ platforms }: { platforms: PlatformIconProps[] }) {
  return (
    <section id="channels" className="py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="fade">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Works on every platform
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Connect all your social media accounts and manage them from one place
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platforms.map((platform, index) => (
            <ScrollReveal key={index} delay={index * 50} direction="up">
              <PlatformIcon {...platform} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
