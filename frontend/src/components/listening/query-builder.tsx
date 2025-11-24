'use client';

import { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialPlatform } from '@/types';

interface QueryBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (query: QueryFormData) => void;
  initialData?: QueryFormData;
}

export interface QueryFormData {
  name: string;
  keywords: string[];
  booleanQuery?: string;
  platforms: SocialPlatform[];
  languages?: string[];
  locations?: string[];
  excludeKeywords?: string[];
  sentimentFilter?: 'positive' | 'neutral' | 'negative';
}

const PLATFORMS = [
  { value: SocialPlatform.INSTAGRAM, label: 'Instagram' },
  { value: SocialPlatform.TWITTER, label: 'Twitter' },
  { value: SocialPlatform.FACEBOOK, label: 'Facebook' },
  { value: SocialPlatform.LINKEDIN, label: 'LinkedIn' },
  { value: SocialPlatform.TIKTOK, label: 'TikTok' },
  { value: SocialPlatform.YOUTUBE, label: 'YouTube' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export function QueryBuilder({ open, onClose, onSave, initialData }: QueryBuilderProps) {
  const [formData, setFormData] = useState<QueryFormData>(
    initialData || {
      name: '',
      keywords: [],
      platforms: [],
      languages: [],
      locations: [],
      excludeKeywords: [],
    }
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [excludeKeywordInput, setExcludeKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  const handleAddExcludeKeyword = () => {
    if (excludeKeywordInput.trim()) {
      setFormData({
        ...formData,
        excludeKeywords: [...(formData.excludeKeywords || []), excludeKeywordInput.trim()],
      });
      setExcludeKeywordInput('');
    }
  };

  const handleRemoveExcludeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      excludeKeywords: formData.excludeKeywords?.filter((k) => k !== keyword),
    });
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const platforms = formData.platforms.includes(platform)
      ? formData.platforms.filter((p) => p !== platform)
      : [...formData.platforms, platform];
    setFormData({ ...formData, platforms });
  };

  const handleSave = () => {
    if (formData.name && formData.keywords.length > 0 && formData.platforms.length > 0) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Listening Query</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a query to monitor mentions, keywords, and conversations across social platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Query Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Query Name</Label>
            <Input
              id="name"
              placeholder="e.g., Brand Mentions, Product Feedback"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-card border-white/10 text-white"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label>Keywords to Monitor</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter keyword and press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="glass-card border-white/10 text-white"
              />
              <Button onClick={handleAddKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="glass-card">
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Boolean Query */}
          <div className="space-y-2">
            <Label htmlFor="booleanQuery">Boolean Query (Optional)</Label>
            <Input
              id="booleanQuery"
              placeholder='e.g., ("brand name" OR @handle) AND (product OR service) NOT spam'
              value={formData.booleanQuery || ''}
              onChange={(e) => setFormData({ ...formData, booleanQuery: e.target.value })}
              className="glass-card border-white/10 text-white"
            />
            <p className="text-xs text-gray-400">
              Use AND, OR, NOT operators for advanced filtering
            </p>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.value}
                    checked={formData.platforms.includes(platform.value)}
                    onCheckedChange={() => handlePlatformToggle(platform.value)}
                  />
                  <label
                    htmlFor={platform.value}
                    className="text-sm cursor-pointer"
                  >
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages (Optional)</Label>
            <Select
              value={formData.languages?.[0]}
              onValueChange={(value) =>
                setFormData({ ...formData, languages: [value] })
              }
            >
              <SelectTrigger className="glass-card border-white/10 text-white">
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-white">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exclude Keywords */}
          <div className="space-y-2">
            <Label>Exclude Keywords (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter keyword to exclude"
                value={excludeKeywordInput}
                onChange={(e) => setExcludeKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExcludeKeyword()}
                className="glass-card border-white/10 text-white"
              />
              <Button onClick={handleAddExcludeKeyword} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.excludeKeywords?.map((keyword) => (
                <Badge key={keyword} variant="destructive" className="glass-card">
                  {keyword}
                  <button
                    onClick={() => handleRemoveExcludeKeyword(keyword)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="space-y-2">
            <Label>Sentiment Filter (Optional)</Label>
            <Select
              value={formData.sentimentFilter}
              onValueChange={(value: any) =>
                setFormData({ ...formData, sentimentFilter: value })
              }
            >
              <SelectTrigger className="glass-card border-white/10 text-white">
                <SelectValue placeholder="All sentiments" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="positive" className="text-white">
                  Positive only
                </SelectItem>
                <SelectItem value="neutral" className="text-white">
                  Neutral only
                </SelectItem>
                <SelectItem value="negative" className="text-white">
                  Negative only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || formData.keywords.length === 0 || formData.platforms.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Query
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
