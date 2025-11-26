'use client';

import { ChevronRight, Users } from 'lucide-react';
import { AnnouncementStripProps } from '@/lib/landing-types';
import { ScrollReveal } from './ScrollReveal';

export function AnnouncementStrip({ badge, message, link }: AnnouncementStripProps) {
  return (
    <section className="py-8 px-6 lg:px-12 bg-cream">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal direction="fade" duration={500}>
          <a
            href={link || '#'}
            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-pastel-yellow border border-yellow-200 hover:border-yellow-300 transition-all group"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-200 text-xs font-semibold text-yellow-900">
                <Users className="w-3 h-3" />
                {badge}
              </span>

              {/* Message */}
              <span className="text-sm md:text-base font-medium text-text-primary">
                {message}
              </span>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-green group-hover:translate-x-1 transition-all flex-shrink-0" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
