'use client';

import { useState } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Calendar, Clock, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SchedulePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

const quickOptions = [
  { label: 'Now', offset: 0 },
  { label: 'In 1 hour', offset: 1 },
  { label: 'In 3 hours', offset: 3 },
  { label: 'Tomorrow 9 AM', offset: 24, hour: 9 },
  { label: 'Tomorrow 2 PM', offset: 24, hour: 14 },
  { label: 'Next Week', offset: 168, hour: 9 },
];

export function SchedulePicker({ selectedDate, onChange, onClose }: SchedulePickerProps) {
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState(format(selectedDate, 'HH:mm'));
  const [timezone, setTimezone] = useState('America/New_York');

  const handleQuickOption = (option: typeof quickOptions[0]) => {
    const now = new Date();
    let newDate = addDays(now, Math.floor(option.offset / 24));
    
    if (option.hour !== undefined) {
      newDate = setHours(newDate, option.hour);
      newDate = setMinutes(newDate, 0);
    } else {
      newDate = new Date(now.getTime() + option.offset * 60 * 60 * 1000);
    }
    
    setDate(newDate);
    setTime(format(newDate, 'HH:mm'));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = setMinutes(setHours(date, hours), minutes);
    setDate(newDate);
    setTime(e.target.value);
  };

  const handleSave = () => {
    onChange(date);
    onClose();
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      {/* Quick Options */}
      <div>
        <label className="text-sm font-medium text-white mb-3 block">
          Quick Schedule
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickOptions.map(option => (
            <button
              key={option.label}
              onClick={() => handleQuickOption(option)}
              className="text-sm px-3 py-2 rounded-lg glass-button hover:bg-white/20 transition-colors text-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Optimal Time */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-sm font-medium text-white">
                AI Recommended Time
              </div>
              <div className="text-xs text-gray-400">
                Best engagement: 2:00 PM EST
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const optimalDate = setMinutes(setHours(new Date(), 14), 0);
              setDate(optimalDate);
              setTime(format(optimalDate, 'HH:mm'));
            }}
          >
            Use
          </Button>
        </div>
      </Card>

      {/* Date Picker */}
      <div>
        <label className="text-sm font-medium text-white mb-3 block">
          <Calendar className="w-4 h-4 inline mr-1" />
          Date
        </label>
        <Input
          type="date"
          value={format(date, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          min={format(new Date(), 'yyyy-MM-dd')}
          className="w-full"
        />
      </div>

      {/* Time Picker */}
      <div>
        <label className="text-sm font-medium text-white mb-3 block">
          <Clock className="w-4 h-4 inline mr-1" />
          Time
        </label>
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="w-full"
        />
      </div>

      {/* Timezone Selector */}
      <div>
        <label className="text-sm font-medium text-white mb-3 block">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full glass-input"
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <Card className="glass-card p-4">
        <div className="text-sm text-gray-400 mb-1">Scheduled for:</div>
        <div className="text-white font-medium">
          {format(date, 'EEEE, MMMM d, yyyy')} at {time}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {timezone.split('/')[1].replace('_', ' ')}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gradient-primary"
          onClick={handleSave}
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm
        </Button>
      </div>
    </Card>
  );
}
