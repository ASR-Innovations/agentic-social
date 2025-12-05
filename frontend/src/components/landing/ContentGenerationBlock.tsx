'use client';

import { useRef, useState, useEffect } from 'react';
import { ContentGenerationBlockProps } from '@/lib/landing-types';
import {
  ArrowRight,
  Sparkles,
  Type,
  FileText,
  Image,
  Hash,
  type LucideIcon,
} from 'lucide-react';

// Local icon map for content types
const contentIconMap: Record<string, LucideIcon> = {
  Type,
  FileText,
  Image,
  Hash,
};

export function ContentGenerationBlock({
  title,
  description,
  contentTypes,
  ctaText,
  ctaLink,
}: ContentGenerationBlockProps) {
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

  const iconColors = ['text-emerald-500', 'text-purple-500', 'text-orange-500', 'text-blue-500'];
  const bgColors = ['bg-emerald-50', 'bg-purple-50', 'bg-orange-50', 'bg-blue-50'];

  return (
    <section
      ref={sectionRef}
      id="content-generation"
      className="relative py-24 px-6 lg:px-12 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            GPT-4 • Claude • DALL-E
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>

          <p className="text-gray-500 text-lg max-w-xl mx-auto">{description}</p>
        </div>

        {/* Content Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contentTypes.map((contentType, index) => (
            <div
              key={contentType.id}
              data-testid="content-type-card"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
              }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${bgColors[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <div className={iconColors[index]}>
                  {(() => {
                    const IconComponent = contentIconMap[contentType.iconName];
                    return IconComponent ? (
                      <IconComponent className="w-7 h-7" />
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {contentType.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {contentType.description}
              </p>

              {/* AI Model Badge */}
              <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                {contentType.aiModel}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
          }}
        >
          <a
            href={ctaLink}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 hover:shadow-xl transition-all duration-300"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContentGenerationBlock;
