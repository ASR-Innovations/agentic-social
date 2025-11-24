'use client';

import { useState } from 'react';
import { Mic, Upload, Save, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-hot-toast';

interface BrandVoiceExample {
  id: string;
  content: string;
  isGoodExample: boolean;
}

export function BrandVoiceTrainer() {
  const [brandName, setBrandName] = useState('');
  const [examples, setExamples] = useState<BrandVoiceExample[]>([]);
  const [currentExample, setCurrentExample] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [voiceProfile, setVoiceProfile] = useState<{
    tone: string;
    formality: number;
    creativity: number;
    keywords: string[];
  } | null>(null);

  const addExample = (isGoodExample: boolean) => {
    if (!currentExample.trim()) {
      toast.error('Please enter an example');
      return;
    }

    const newExample: BrandVoiceExample = {
      id: Date.now().toString(),
      content: currentExample,
      isGoodExample,
    };

    setExamples([...examples, newExample]);
    setCurrentExample('');
    toast.success(`${isGoodExample ? 'Good' : 'Bad'} example added!`);
  };

  const removeExample = (id: string) => {
    setExamples(examples.filter(e => e.id !== id));
  };

  const handleTrain = async () => {
    if (examples.length < 3) {
      toast.error('Please add at least 3 examples');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      // Simulate training progress
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // Mock training result
      setTimeout(() => {
        setVoiceProfile({
          tone: 'Professional yet approachable',
          formality: 65,
          creativity: 75,
          keywords: ['innovative', 'customer-focused', 'quality', 'reliable'],
        });
        setIsTraining(false);
        toast.success('Brand voice trained successfully!');
      }, 3000);
    } catch (error) {
      toast.error('Failed to train brand voice');
      console.error(error);
      setIsTraining(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Mic className="w-5 h-5 mr-2" />
          Brand Voice Trainer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Train AI to match your brand's unique voice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brandName" className="text-white">Brand Name</Label>
          <Input
            id="brandName"
            placeholder="Your brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        {/* Guidelines */}
        <div className="space-y-2">
          <Label htmlFor="guidelines" className="text-white">Brand Guidelines (Optional)</Label>
          <Textarea
            id="guidelines"
            placeholder="Describe your brand's tone, values, and communication style..."
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        {/* Example Input */}
        <div className="space-y-2">
          <Label htmlFor="example" className="text-white">
            Add Example Content
            <span className="text-gray-500 text-xs ml-2">
              ({examples.length} examples added)
            </span>
          </Label>
          <Textarea
            id="example"
            placeholder="Paste example content that represents your brand voice..."
            value={currentExample}
            onChange={(e) => setCurrentExample(e.target.value)}
            className="min-h-[100px] bg-gray-800/50 border-gray-700 text-white"
          />
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => addExample(true)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Good Example
            </Button>
            <Button
              variant="outline"
              onClick={() => addExample(false)}
              className="flex-1"
            >
              Bad Example
            </Button>
          </div>
        </div>

        {/* Examples List */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <Label className="text-white">Training Examples</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className={`p-3 rounded-lg border ${
                    example.isGoodExample
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={example.isGoodExample ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {example.isGoodExample ? 'Good' : 'Bad'} Example
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(example.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-white line-clamp-2">{example.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Progress */}
        {isTraining && (
          <div className="space-y-2">
            <Label className="text-white">Training Progress</Label>
            <Progress value={trainingProgress} className="h-2" />
            <p className="text-xs text-gray-400 text-center">
              Analyzing brand voice patterns... {trainingProgress}%
            </p>
          </div>
        )}

        {/* Train Button */}
        <Button
          onClick={handleTrain}
          disabled={isTraining || examples.length < 3}
          className="w-full"
        >
          {isTraining ? (
            'Training...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Train Brand Voice
            </>
          )}
        </Button>

        {/* Voice Profile */}
        {voiceProfile && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 space-y-3">
            <h4 className="text-white font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Brand Voice Profile
            </h4>

            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Tone</p>
                <p className="text-white">{voiceProfile.tone}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Formality Level</p>
                <div className="flex items-center space-x-2">
                  <Progress value={voiceProfile.formality} className="h-2 flex-1" />
                  <span className="text-white text-sm">{voiceProfile.formality}%</span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Creativity Level</p>
                <div className="flex items-center space-x-2">
                  <Progress value={voiceProfile.creativity} className="h-2 flex-1" />
                  <span className="text-white text-sm">{voiceProfile.creativity}%</span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Key Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {voiceProfile.keywords.map((keyword, index) => (
                    <Badge key={index} variant="glass" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
