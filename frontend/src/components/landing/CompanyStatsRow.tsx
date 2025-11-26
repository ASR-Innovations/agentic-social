'use client';

import { CompanyStatCardProps } from '@/lib/landing-types';

function CompanyStatCard({ value, label, icon }: CompanyStatCardProps) {
  return (
    <div
      data-testid="company-stat-card"
      className="bg-white rounded-xl p-6 shadow-buffer hover:shadow-buffer-lg transition-all text-center"
    >
      <div className="space-y-3">
        {icon && (
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto">
            {icon}
          </div>
        )}
        <div className="text-3xl font-bold text-brand-green">{value}</div>
        <div className="text-sm font-medium text-text-muted uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

export function CompanyStatsRow({ stats }: { stats: CompanyStatCardProps[] }) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <CompanyStatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
