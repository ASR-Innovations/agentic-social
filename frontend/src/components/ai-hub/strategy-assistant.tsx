'use client';

import { useState } from 'react';
import { Target, Calendar, Clock, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface StrategyRecommendation {
  id: string;
  type: 'content' | 'timing' | 'audience' | 'platform';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export function StrategyAssistant() {
  const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<{
    bestPostingTimes: string[];
    topPerformingContent: string[];
    audienceGrowthTrend: string;
    engagementRate: number;
  } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Mock analysis
      const mockRecommendations: StrategyRecommendation[] = [
        {
          id: '1',
          type: 'timing',
          title: 'Optimize Posting Schedule',
          description: 'Your audience is most active on weekdays between 9 AM - 11 AM and 6 PM - 8 PM. Consider scheduling more posts during these windows.',
          impact: 'high',
          confidence: 92,
        },
        {
          id: '2',
          type: 'content',
          title: 'Increase Video Content',
          description: 'Video posts generate 3x more engagement than image posts. Aim for 40% video content in your mix.',
          impact: 'high',
          confidence: 88,
        },
        {
          id: '3',
          type: 'audience',
          title: 'Target Younger Demographics',
          description: 'Your content resonates well with 25-34 age group. Consider creating content specifically for this segment.',
          impact: 'medium',
          confidence: 85,
        },
        {
          id: '4',
          type: 'platform',
          title: 'Expand to TikTok',
          description: 'Your content style aligns well with TikTok trends. This platform could drive significant growth.',
          impact: 'medium',
          confidence: 78,
        },
      ];

      setRecommendations(mockRecommendations);
      setInsights({
        bestPostingTimes: ['9:00 AM', '11:00 AM', '6:00 PM', '8:00 PM'],
        topPerformingContent: ['Product demos', 'Behind-the-scenes', 'User testimonials'],
        audienceGrowthTrend: '+15% this month',
        engagementRate: 4.2,
      });

      toast.success('Strategy analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze strategy');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'medium':
        return 'from-yellow-500 to-amber-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return BarChart3;
      case 'timing':
        return Clock;
      case 'audience':
        return Users;
      case 'platform':
        return TrendingUp;
      default:
        return Target;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Strategy Assistant
        </CardTitle>
        <CardDescription className="text-gray-400">
          Get AI-powered strategic recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze My Strategy'}
        </Button>

        {/* Key Insights */}
        {insights && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-gray-400 text-xs">Best Times</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {insights.bestPostingTimes.map((time, index) => (
                  <Badge key={index} variant="glass" className="text-xs">
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-gray-400 text-xs">Growth</p>
              </div>
              <p className="text-white text-lg font-bold">{insights.audienceGrowthTrend}</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <p className="text-gray-400 text-xs">Engagement</p>
              </div>
              <p className="text-white text-lg font-bold">{insights.engagementRate}%</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-orange-400" />
                <p className="text-gray-400 text-xs">Top Content</p>
              </div>
              <p className="text-white text-xs">{insights.topPerformingContent[0]}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Strategic Recommendations</h4>
            {recommendations.map((rec) => {
              const Icon = getTypeIcon(rec.type);
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getImpactColor(rec.impact)} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-semibold">{rec.title}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="glass" className="text-xs capitalize">
                            {rec.type}
                          </Badge>
                          <Badge
                            variant="glass"
                            className={`text-xs bg-gradient-to-r ${getImpactColor(rec.impact)}`}
                          >
                            {rec.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Confidence</p>
                      <p className="text-white font-semibold">{rec.confidence}%</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">{rec.description}</p>

                  <Button variant="secondary" size="sm" className="w-full">
                    Apply Recommendation
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Monthly Calendar Themes */}
        {insights && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h5 className="text-white font-semibold mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Suggested Content Themes
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Week 1:</span>
                <span className="text-white">Product Education</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Week 2:</span>
                <span className="text-white">Customer Stories</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Week 3:</span>
                <span className="text-white">Behind the Scenes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Week 4:</span>
                <span className="text-white">Community Engagement</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
