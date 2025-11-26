'use client';

import { TestimonialCardProps } from '@/lib/landing-types';
import { Star } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

function TestimonialCard({ quote, authorName, authorPhoto, authorRole }: TestimonialCardProps) {
  return (
    <div
      data-testid="testimonial-card"
      className="bg-white rounded-2xl p-8 shadow-buffer hover:shadow-buffer-lg transition-all"
    >
      <div className="space-y-6">
        {/* Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-brand-green text-brand-green" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-base text-text-primary leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {authorPhoto || authorName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-text-primary">{authorName}</p>
            {authorRole && (
              <p className="text-sm text-text-muted">{authorRole}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialArea({ testimonials }: { testimonials: TestimonialCardProps[] }) {
  return (
    <section className="py-20 px-6 lg:px-12 bg-pastel-lavender">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="fade">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              See what our customers have to say about SocialAI
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 150} direction="up">
              <TestimonialCard {...testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
