'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
  { label: 'This month', value: 'month', days: 30 },
  { label: 'Last 6 months', value: '6m', days: 180 },
  { label: 'This year', value: 'year', days: 365 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState(value.preset || '30d');

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const presetConfig = presets.find((p) => p.value === preset);
    if (presetConfig) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - presetConfig.days);
      onChange({ startDate, endDate, preset });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-400" />
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px] glass-card border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/10">
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
