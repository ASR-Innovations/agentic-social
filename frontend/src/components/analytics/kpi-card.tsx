'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  loading = false,
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
            {change !== undefined && !loading && (
              <Badge
                variant={isPositive ? 'success' : 'destructive'}
                className="text-xs mt-2"
              >
                {isPositive ? '+' : ''}
                {change}% {changeLabel || 'vs last period'}
              </Badge>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
