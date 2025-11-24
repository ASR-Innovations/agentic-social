'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' },
];

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

interface ContentVariation {
  id: string;
  content: string;
  platform: string;
  score: number;
  reasoning: string;
}

export function ContentGenerationPanel() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cost, setCost] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiClient.generateContent({
        prompt,
        type: 'text',
        tone,
        context: {
          platforms: selectedPlatforms,
        },
      });

      // Mock variations for now
      const mockVariations: ContentVariation[] = selectedPlatforms.map((platform, index) => ({
        id: `${platform}-${index}`,
        content: response.content || `Generated content for ${platform} with ${tone} tone: ${prompt}`,
        platform,
        score: 85 + Math.random() * 15,
        reasoning: `Optimized for ${platform} audience with ${tone} tone`,
      }));

      setVariations(mockVariations);
      setCost(response.cost || 0.02);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          Content Generation
        </CardTitle>
        <CardDescription className="text-gray-400">
          Generate engaging content with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-white">What would you like to create?</Label>
          <Textarea
            id="prompt"
            placeholder="E.g., Create a post about our new product launch..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-white">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platform Selector */}
        <div className="space-y-2">
          <Label className="text-white">Platforms</Label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <Badge
                key={platform.value}
                variant={selectedPlatforms.includes(platform.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => togglePlatform(platform.value)}
              >
                {platform.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {/* Generated Variations */}
        {variations.length > 0 && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Generated Variations</h3>
              <Badge variant="glass" className="text-xs">
                Cost: ${cost.toFixed(4)}
              </Badge>
            </div>

            {variations.map((variation) => (
              <div
                key={variation.id}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="glass" className="capitalize">
                    {variation.platform}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Score: {variation.score.toFixed(0)}%
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(variation.content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-white text-sm">{variation.content}</p>

                <p className="text-xs text-gray-500">{variation.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
