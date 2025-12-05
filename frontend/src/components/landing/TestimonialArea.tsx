'use client';

import { useRef, useState, useEffect } from 'react';
import { TestimonialCardProps } from '@/lib/landing-types';
import { Star, Quote } from 'lucide-react';

function TestimonialCard({
  quote,
  authorName,
  authorPhoto,
  authorRole,
  index,
  isVisible,
}: TestimonialCardProps & { index: number; isVisible: boolean }) {
  return (
    <div
      data-testid="testimonial-card"
      className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`,
      }}
    >
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-emerald-200 mb-4" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-4 h-4 fill-amber-400 text-amber-400"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6">"{quote}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
          {authorPhoto ||
            authorName
              .split(' ')
              .map((n) => n[0])
              .join('')}
        </div>
        <div>
          <p className="text-gray-900 text-sm font-medium">{authorName}</p>
          {authorRole && <p className="text-gray-500 text-xs">{authorRole}</p>}
        </div>
      </div>
    </div>
  );
}

export function TestimonialArea({
  testimonials,
}: {
  testimonials: TestimonialCardProps[];
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 lg:px-12 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            See what marketing teams and creators are saying about our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialArea;
