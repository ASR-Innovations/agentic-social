'use client';

import { useState } from 'react';
import { Search, Filter, X, Instagram, Twitter, Linkedin, Facebook, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface CalendarFilters {
  search: string;
  platforms: string[];
  status: string[];
  dateRange: { start: Date | null; end: Date | null };
  tags: string[];
}

interface CalendarFiltersProps {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
  onReset: () => void;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'twitter', name: 'Twitter', icon: Twitter },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
];

const statuses = [
  { id: 'draft', name: 'Draft', color: 'bg-gray-500' },
  { id: 'scheduled', name: 'Scheduled', color: 'bg-blue-500' },
  { id: 'published', name: 'Published', color: 'bg-green-500' },
  { id: 'failed', name: 'Failed', color: 'bg-red-500' },
];

export function CalendarFilters({ filters, onChange, onReset }: CalendarFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const togglePlatform = (platformId: string) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(id => id !== platformId)
      : [...filters.platforms, platformId];
    onChange({ ...filters, platforms: newPlatforms });
  };

  const toggleStatus = (statusId: string) => {
    const newStatus = filters.status.includes(statusId)
      ? filters.status.filter(id => id !== statusId)
      : [...filters.status, statusId];
    onChange({ ...filters, status: newStatus });
  };

  const activeFilterCount = 
    filters.platforms.length + 
    filters.status.length + 
    (filters.dateRange.start ? 1 : 0) +
    filters.tags.length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="glass"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.platforms.map(platformId => {
            const platform = platforms.find(p => p.id === platformId);
            if (!platform) return null;
            const Icon = platform.icon;
            
            return (
              <Badge
                key={platformId}
                variant="glass"
                className="cursor-pointer hover:bg-white/20"
                onClick={() => togglePlatform(platformId)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {platform.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
          {filters.status.map(statusId => {
            const status = statuses.find(s => s.id === statusId);
            if (!status) return null;
            
            return (
              <Badge
                key={statusId}
                variant="glass"
                className="cursor-pointer hover:bg-white/20"
                onClick={() => toggleStatus(statusId)}
              >
                <div className={`w-2 h-2 rounded-full ${status.color} mr-1`} />
                {status.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
          {filters.dateRange.start && (
            <Badge
              variant="glass"
              className="cursor-pointer hover:bg-white/20"
              onClick={() => onChange({ ...filters, dateRange: { start: null, end: null } })}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Date Range
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="glass-card p-6 space-y-6">
          {/* Platform Filter */}
          <div>
            <label className="text-sm font-medium text-white mb-3 block">
              Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(platform => {
                const Icon = platform.icon;
                const isSelected = filters.platforms.includes(platform.id);
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'glass-card ring-2 ring-blue-500'
                        : 'glass-button hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-white mb-3 block">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map(status => {
                const isSelected = filters.status.includes(status.id);
                
                return (
                  <button
                    key={status.id}
                    onClick={() => toggleStatus(status.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'glass-card ring-2 ring-blue-500'
                        : 'glass-button hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className="text-white text-sm">{status.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium text-white mb-3 block">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From</label>
                <Input
                  type="date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null,
                    },
                  })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To</label>
                <Input
                  type="date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null,
                    },
                  })}
                />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="text-sm font-medium text-white mb-3 block">
              Tags
            </label>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Add tag filter..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    onChange({
                      ...filters,
                      tags: [...filters.tags, e.currentTarget.value],
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="glass"
                    className="cursor-pointer hover:bg-white/20"
                    onClick={() => onChange({
                      ...filters,
                      tags: filters.tags.filter((_, i) => i !== index),
                    })}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
