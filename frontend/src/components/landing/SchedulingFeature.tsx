'use client';

import { SchedulingFeatureProps } from '@/lib/landing-types';
import {
  Calendar,
  Check,
  Clock,
  Edit3,
  Send,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';

// Local icon map for publishing options
const publishingIconMap: Record<string, LucideIcon> = {
  Edit3,
  Calendar,
  Send,
};

export function SchedulingFeature({
  title,
  description,
  features,
  calendarImage,
  publishingOptions,
}: SchedulingFeatureProps) {
  return (
    <section id="scheduling" className="py-24 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" />
              <span>Smart Scheduling</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-500 mb-8">{description}</p>

            {/* Features List */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Publishing Options */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Publishing Options
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {publishingOptions.map((option) => (
                  <div
                    key={option.type}
                    className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <div className="text-gray-600">
                        {(() => {
                          const IconComponent =
                            publishingIconMap[option.iconName];
                          return IconComponent ? (
                            <IconComponent className="w-5 h-5" />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Calendar Image */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Mock Calendar Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Content Calendar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>December 2025</span>
                  </div>
                </div>
              </div>

              {/* Calendar Image */}
              <div className="aspect-[4/3] relative bg-gray-50">
                <Image
                  src={calendarImage}
                  alt="Content calendar showing scheduled posts"
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={85}
                />

                {/* Overlay with mock calendar events */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-blue-500 text-white text-xs p-2 rounded-lg shadow-sm">
                      Twitter 9:00 AM
                    </div>
                    <div className="flex-1 bg-pink-500 text-white text-xs p-2 rounded-lg shadow-sm">
                      Instagram 12:00 PM
                    </div>
                    <div className="flex-1 bg-blue-700 text-white text-xs p-2 rounded-lg shadow-sm">
                      LinkedIn 3:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SchedulingFeature;
