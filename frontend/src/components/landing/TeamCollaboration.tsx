'use client';

import { TeamCollaborationProps } from '@/lib/landing-types';
import {
  Users,
  Check,
  Shield,
  UserCheck,
  Edit3,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';

// Local icon map for team roles
const teamRoleIconMap: Record<string, LucideIcon> = {
  Shield,
  UserCheck,
  Edit3,
  Eye,
};

export function TeamCollaboration({
  title,
  description,
  roles,
  features,
  teamImage,
}: TeamCollaborationProps) {
  return (
    <section id="team" className="py-24 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="aspect-[4/3] relative bg-gray-50">
                <Image
                  src={teamImage}
                  alt="Team collaborating on social media content"
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={85}
                />
              </div>

              {/* Overlay with team activity */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['SC', 'MR', 'EW', 'JD'].map((initials, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-white text-sm">
                    4 team members active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Team Collaboration</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-500 mb-8">{description}</p>

            {/* Roles Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {roles.map((role) => (
                <div
                  key={role.name}
                  data-testid="role-card"
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 border border-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="text-gray-600">
                        {(() => {
                          const IconComponent = teamRoleIconMap[role.iconName];
                          return IconComponent ? (
                            <IconComponent className="w-5 h-5" />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">{role.name}</h4>
                  </div>
                  <ul className="space-y-1">
                    {role.permissions.slice(0, 2).map((permission, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-500 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        {permission}
                      </li>
                    ))}
                    {role.permissions.length > 2 && (
                      <li className="text-xs text-gray-400">
                        +{role.permissions.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Enterprise Features
              </p>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
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

export default TeamCollaboration;
