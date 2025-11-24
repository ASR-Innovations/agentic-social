'use client';

import { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface Suggestion {
  type: 'improvement' | 'warning' | 'success';
  original: string;
  suggested: string;
  reasoning: string;
}

export function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [predictedPerformance, setPredictedPerformance] = useState<{
    engagementRate: number;
    reachEstimate: number;
  } | null>(null);

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      // Mock optimization for now
      const mockSuggestions: Suggestion[] = [
        {
          type: 'improvement',
          original: 'Check out our new product',
          suggested: 'Discover our game-changing new product 🚀',
          reasoning: 'Adding emojis and power words increases engagement by 25%',
        },
        {
          type: 'warning',
          original: 'Link in bio',
          suggested: 'Tap the link in our bio to learn more',
          reasoning: 'Clear call-to-action improves click-through rate',
        },
        {
          type: 'success',
          original: 'hashtags',
          suggested: 'Use 5-10 relevant hashtags',
          reasoning: 'Optimal hashtag count for maximum reach',
        },
      ];

      setSuggestions(mockSuggestions);
      setPredictedPerformance({
        engagementRate: 4.2 + Math.random() * 2,
        reachEstimate: 5000 + Math.random() * 3000,
      });

      toast.success('Content optimized!');
    } catch (error) {
      toast.error('Failed to optimize content');
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    setContent(prev => prev.replace(suggestion.original, suggestion.suggested));
    toast.success('Suggestion applied!');
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Content Optimizer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Get AI-powered suggestions to improve your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Input */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-white">Your Content</Label>
          <Textarea
            id="content"
            placeholder="Paste your content here to get optimization suggestions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        {/* Optimize Button */}
        <Button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full"
          variant="secondary"
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Content'}
        </Button>

        {/* Predicted Performance */}
        {predictedPerformance && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predicted Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Engagement Rate</p>
                <p className="text-white text-xl font-bold">
                  {predictedPerformance.engagementRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estimated Reach</p>
                <p className="text-white text-xl font-bold">
                  {predictedPerformance.reachEstimate.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Optimization Suggestions</h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {suggestion.type === 'improvement' && (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                    {suggestion.type === 'warning' && (
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    )}
                    {suggestion.type === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <Badge variant="glass" className="text-xs capitalize">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-400 line-through">{suggestion.original}</p>
                  <p className="text-sm text-white">{suggestion.suggested}</p>
                </div>

                <p className="text-xs text-gray-500">{suggestion.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
