'use client';

import { useRef, useState, useEffect } from 'react';
import { PlatformIconProps } from '@/lib/landing-types';
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Zap,
  Target,
  MessageCircle,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

// Local icon map for platforms
const platformIconMap: Record<string, LucideIcon> = {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Zap,
  Target,
  MessageCircle,
  MessageSquare,
};

function PlatformIcon({
  platform,
  iconName,
  index,
  isVisible,
}: PlatformIconProps & { index: number; isVisible: boolean }) {
  return (
    <div
      data-testid="platform-icon"
      aria-label={`${platform} integration`}
      title={platform}
      className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s`,
      }}
    >
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
        <div className="text-gray-500 group-hover:text-emerald-600 transition-colors">
          {(() => {
            const IconComponent = platformIconMap[iconName];
            return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
          })()}
        </div>
      </div>
      <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors font-medium">
        {platform}
      </span>
    </div>
  );
}

export function PlatformGrid({ platforms }: { platforms: PlatformIconProps[] }) {
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
      id="channels"
      className="relative py-24 px-6 lg:px-12 bg-white"
    >
      <div className="max-w-4xl mx-auto">
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
            One Dashboard, Every Platform
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Connect and manage all your social accounts from a single workspace.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {platforms.map((platform, index) => (
            <PlatformIcon
              key={index}
              {...platform}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Security note */}
        <div
          className="text-center mt-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}
        >
          <p className="text-xs text-gray-400">
            OAuth 2.0 • Enterprise encryption • Automatic token refresh
          </p>
        </div>
      </div>
    </section>
  );
}

export default PlatformGrid;
