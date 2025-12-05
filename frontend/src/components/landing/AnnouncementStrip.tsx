'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import { AnnouncementStripProps } from '@/lib/landing-types';

export function AnnouncementStrip({ badge, message, link }: AnnouncementStripProps) {
  return (
    <section className="py-4 px-6 lg:px-12 bg-emerald-50 border-b border-emerald-100">
      <div className="max-w-4xl mx-auto">
        <a
          href={link || '#'}
          className="group flex items-center justify-center gap-3 text-sm"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            {badge}
          </span>
          
          <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
            {message}
          </span>
          
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </a>
      </div>
    </section>
  );
}

export default AnnouncementStrip;
