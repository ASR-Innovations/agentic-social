'use client';

import { AnalyticsFeatureProps } from '@/lib/landing-types';
import {
  BarChart3,
  Check,
  TrendingUp,
  Eye,
  Heart,
  MousePointer,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';

// Local icon map for analytics metrics
const analyticsIconMap: Record<string, LucideIcon> = {
  Eye,
  Heart,
  TrendingUp,
  MousePointer,
  Share2,
};

export function AnalyticsFeature({
  title,
  description,
  metrics,
  dashboardImage,
  highlights,
}: AnalyticsFeatureProps) {
  return (
    <section
      id="analytics"
      className="py-24 px-6 lg:px-12 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>Real-Time Insights</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              data-testid="metric-card"
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <div className="text-emerald-600">
                  {(() => {
                    const IconComponent = analyticsIconMap[metric.iconName];
                    return IconComponent ? (
                      <IconComponent className="w-5 h-5" />
                    ) : null;
                  })()}
                </div>
              </div>
              {metric.value && (
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </p>
              )}
              <p className="text-sm font-medium text-gray-700">{metric.name}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Preview and Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard Image */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-semibold">Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+23% this week</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Image */}
              <div className="aspect-[4/3] relative bg-gray-50">
                <Image
                  src={dashboardImage}
                  alt="Analytics dashboard"
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={85}
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Everything you need to measure success
            </h3>

            <ul className="space-y-4 mb-8">
              {highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Platform breakdown preview */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Platform Breakdown
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Twitter', percentage: 35, color: 'bg-blue-500' },
                  { name: 'Instagram', percentage: 28, color: 'bg-pink-500' },
                  { name: 'LinkedIn', percentage: 22, color: 'bg-blue-700' },
                  { name: 'Others', percentage: 15, color: 'bg-gray-400' },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20">
                      {platform.name}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${platform.color} rounded-full transition-all duration-500`}
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10">
                      {platform.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsFeature;
