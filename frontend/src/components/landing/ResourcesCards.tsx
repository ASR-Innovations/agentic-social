'use client';

import { ResourceCardProps } from '@/lib/landing-types';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

function ResourceCard({ title, description, image, backgroundColor, link }: ResourceCardProps) {
  return (
    <a
      href={link || '#'}
      data-testid="resource-card"
      className="block rounded-2xl p-8 shadow-buffer hover:shadow-buffer-lg hover:-translate-y-1 transition-all duration-150 ease-in-out group"
      style={{ backgroundColor }}
    >
      <div className="space-y-4">
        {image && (
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <span className="text-2xl">📚</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        <div className="flex items-center gap-2 text-sm font-medium text-brand-green group-hover:gap-3 transition-all">
          Learn more
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}

export function ResourcesCards({ resources }: { resources: ResourceCardProps[] }) {
  return (
    <section id="resources" className="py-20 px-6 lg:px-12 bg-cream">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="fade">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Resources to help you succeed
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Guides, tutorials, and documentation to get the most out of SocialAI
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <ScrollReveal key={index} delay={index * 150} direction="up">
              <ResourceCard {...resource} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
