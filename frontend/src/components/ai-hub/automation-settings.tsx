'use client';

import { useState } from 'react';
import { Settings, Zap, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

export function AutomationSettings() {
  const [automationMode, setAutomationMode] = useState('assisted');
  const [autoPublish, setAutoPublish] = useState(false);
  const [autoRespond, setAutoRespond] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [creativityLevel, setCreativityLevel] = useState([70]);
  const [postingFrequency, setPostingFrequency] = useState('moderate');
  const [contentApproval, setContentApproval] = useState(true);

  const handleSave = () => {
    toast.success('Automation settings saved!');
  };

  const automationModes = [
    {
      value: 'manual',
      label: 'Manual',
      description: 'AI provides suggestions only',
      icon: Shield,
      color: 'from-gray-500 to-gray-600',
    },
    {
      value: 'assisted',
      label: 'Assisted',
      description: 'AI helps with content creation',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      value: 'hybrid',
      label: 'Hybrid',
      description: 'Mix of automated and manual',
      icon: Settings,
      color: 'from-purple-500 to-pink-500',
    },
    {
      value: 'autonomous',
      label: 'Autonomous',
      description: 'Full AI automation',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const selectedMode = automationModes.find(m => m.value === automationMode);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Automation Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure AI automation behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Automation Mode */}
        <div className="space-y-3">
          <Label className="text-white">Automation Mode</Label>
          <div className="grid grid-cols-2 gap-3">
            {automationModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.value}
                  onClick={() => setAutomationMode(mode.value)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    automationMode === mode.value
                      ? 'border-white/30 bg-white/5'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${mode.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{mode.label}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{mode.description}</p>
                </div>
              );
            })}
          </div>
          {selectedMode && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-gray-300">
                <strong className="text-white">{selectedMode.label} Mode:</strong> {selectedMode.description}
              </p>
            </div>
          )}
        </div>

        {/* Automation Features */}
        <div className="space-y-4">
          <Label className="text-white">Automation Features</Label>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex-1">
              <p className="text-white font-medium">Auto-Publish Content</p>
              <p className="text-xs text-gray-400">Automatically publish approved content</p>
            </div>
            <Switch
              checked={autoPublish}
              onCheckedChange={setAutoPublish}
              disabled={automationMode === 'manual'}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex-1">
              <p className="text-white font-medium">Auto-Respond to Messages</p>
              <p className="text-xs text-gray-400">AI responds to common inquiries</p>
            </div>
            <Switch
              checked={autoRespond}
              onCheckedChange={setAutoRespond}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex-1">
              <p className="text-white font-medium">Auto-Optimize Content</p>
              <p className="text-xs text-gray-400">Automatically apply optimization suggestions</p>
            </div>
            <Switch
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex-1">
              <p className="text-white font-medium">Require Content Approval</p>
              <p className="text-xs text-gray-400">Review content before publishing</p>
            </div>
            <Switch
              checked={contentApproval}
              onCheckedChange={setContentApproval}
            />
          </div>
        </div>

        {/* Creativity Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white">Creativity Level</Label>
            <Badge variant="glass" className="text-xs">
              {creativityLevel[0]}%
            </Badge>
          </div>
          <Slider
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Posting Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency" className="text-white">Posting Frequency</Label>
          <Select value={postingFrequency} onValueChange={setPostingFrequency}>
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (1-2 posts/day)</SelectItem>
              <SelectItem value="moderate">Moderate (3-5 posts/day)</SelectItem>
              <SelectItem value="high">High (6-10 posts/day)</SelectItem>
              <SelectItem value="aggressive">Aggressive (10+ posts/day)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Warning for Autonomous Mode */}
        {automationMode === 'autonomous' && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Autonomous Mode Active</p>
              <p className="text-xs text-gray-400 mt-1">
                AI will generate and publish content automatically. Monitor regularly to ensure quality and brand alignment.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
