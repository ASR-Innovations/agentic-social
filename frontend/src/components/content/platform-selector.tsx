'use client';

import { Instagram, Twitter, Linkedin, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onChange: (platforms: string[]) => void;
}

const platforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 to-purple-500',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-500 to-red-700',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: MessageCircle,
    color: 'from-gray-800 to-gray-900',
  },
];

export function PlatformSelector({ selectedPlatforms, onChange }: PlatformSelectorProps) {
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onChange(selectedPlatforms.filter(id => id !== platformId));
    } else {
      onChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {platforms.map(platform => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                isSelected
                  ? 'glass-card ring-2 ring-blue-500'
                  : 'glass-button hover:bg-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded bg-gradient-to-r ${platform.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium text-sm">
                  {platform.name}
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedPlatforms.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Selected:</span>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map(platformId => {
              const platform = platforms.find(p => p.id === platformId);
              if (!platform) return null;
              
              return (
                <Badge key={platformId} variant="glass" className="text-xs">
                  {platform.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
