'use client';

import { useState } from 'react';
import { Hash, Copy, TrendingUp, Target, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface Hashtag {
  tag: string;
  category: 'high-reach' | 'medium-reach' | 'niche';
  competition: 'low' | 'medium' | 'high';
  relevanceScore: number;
  estimatedReach: number;
}

export function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Mock hashtags for now
      const mockHashtags: Hashtag[] = [
        {
          tag: '#' + topic.toLowerCase().replace(/\s+/g, ''),
          category: 'high-reach',
          competition: 'high',
          relevanceScore: 95,
          estimatedReach: 500000,
        },
        {
          tag: '#' + topic.toLowerCase().replace(/\s+/g, '') + 'tips',
          category: 'medium-reach',
          competition: 'medium',
          relevanceScore: 88,
          estimatedReach: 150000,
        },
        {
          tag: '#' + topic.toLowerCase().replace(/\s+/g, '') + 'community',
          category: 'niche',
          competition: 'low',
          relevanceScore: 92,
          estimatedReach: 50000,
        },
        {
          tag: '#trending' + topic.toLowerCase().replace(/\s+/g, ''),
          category: 'high-reach',
          competition: 'medium',
          relevanceScore: 85,
          estimatedReach: 300000,
        },
        {
          tag: '#' + topic.toLowerCase().replace(/\s+/g, '') + 'life',
          category: 'medium-reach',
          competition: 'low',
          relevanceScore: 90,
          estimatedReach: 120000,
        },
      ];

      setHashtags(mockHashtags);
      toast.success('Hashtags generated!');
    } catch (error) {
      toast.error('Failed to generate hashtags');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyHashtags = () => {
    const hashtagString = hashtags.map(h => h.tag).join(' ');
    navigator.clipboard.writeText(hashtagString);
    toast.success('Hashtags copied to clipboard!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high-reach':
        return 'from-green-500 to-emerald-500';
      case 'medium-reach':
        return 'from-blue-500 to-cyan-500';
      case 'niche':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Hashtag Generator
        </CardTitle>
        <CardDescription className="text-gray-400">
          Discover trending and relevant hashtags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-white">Topic or Keyword</Label>
          <div className="flex space-x-2">
            <Input
              id="topic"
              placeholder="E.g., fitness, travel, food..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        {/* Generated Hashtags */}
        {hashtags.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">Suggested Hashtags</h4>
              <Button variant="ghost" size="sm" onClick={copyHashtags}>
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            </div>

            <div className="space-y-2">
              {hashtags.map((hashtag, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono font-semibold">{hashtag.tag}</span>
                      <Badge
                        variant="glass"
                        className={`text-xs bg-gradient-to-r ${getCategoryColor(hashtag.category)}`}
                      >
                        {hashtag.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(hashtag.tag);
                        toast.success('Copied!');
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Relevance:</span>
                      <span className="text-white">{hashtag.relevanceScore}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Reach:</span>
                      <span className="text-white">
                        {hashtag.estimatedReach > 1000
                          ? `${(hashtag.estimatedReach / 1000).toFixed(0)}K`
                          : hashtag.estimatedReach}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Competition:</span>
                      <span className={getCompetitionColor(hashtag.competition)}>
                        {hashtag.competition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hashtag Strategy Tips */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h5 className="text-white text-sm font-semibold mb-2">💡 Hashtag Strategy</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Mix high-reach, medium-reach, and niche hashtags</li>
                <li>• Use 5-10 hashtags for optimal engagement</li>
                <li>• Avoid overly competitive hashtags</li>
                <li>• Update hashtags based on performance</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
