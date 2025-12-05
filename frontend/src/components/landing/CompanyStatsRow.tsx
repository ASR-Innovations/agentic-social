'use client';

import { CompanyStatCardProps } from '@/lib/landing-types';
import {
  Globe,
  Users,
  TrendingUp,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

// Local icon map for company stats
const companyStatsIconMap: Record<string, LucideIcon> = {
  Globe,
  Users,
  TrendingUp,
  MessageCircle,
};

function CompanyStatCard({ value, label, iconName }: CompanyStatCardProps) {
  const IconComponent = iconName ? companyStatsIconMap[iconName] : null;

  return (
    <div
      data-testid="company-stat-card"
      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all text-center"
    >
      <div className="space-y-3">
        {IconComponent && (
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <IconComponent className="w-5 h-5 text-emerald-600" />
          </div>
        )}
        <div className="text-3xl font-bold text-emerald-600">{value}</div>
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

export function CompanyStatsRow({ stats }: { stats: CompanyStatCardProps[] }) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Trusted by teams worldwide
          </h2>
          <p className="text-gray-500">
            Join thousands of companies using SocialAI
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <CompanyStatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompanyStatsRow;
