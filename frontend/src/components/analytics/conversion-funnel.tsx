'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  loading?: boolean;
}

export function ConversionFunnel({ stages, loading = false }: ConversionFunnelProps) {
  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="h-6 w-48 bg-white/10 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white/5 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = stages[0]?.value || 1;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Conversion Funnel</CardTitle>
        <CardDescription className="text-gray-400">
          Track user journey from impression to conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = (stage.value / maxValue) * 100;
            const dropoff = index > 0 ? stages[index - 1].value - stage.value : 0;
            const dropoffRate = index > 0 ? (dropoff / stages[index - 1].value) * 100 : 0;

            return (
              <div key={stage.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{stage.name}</span>
                    <span className="text-xs text-gray-400">
                      ({stage.percentage.toFixed(1)}% of total)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-12 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex items-center justify-center my-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <ArrowDown className="w-4 h-4" />
                      {dropoffRate > 0 && (
                        <span className="text-red-400">
                          -{dropoffRate.toFixed(1)}% drop-off
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
