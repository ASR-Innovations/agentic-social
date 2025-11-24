'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Clock, CheckCircle, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import AI Hub components
import { AgentStatusPanel } from '@/components/ai-hub/agent-status-panel';
import { ContentGenerationPanel } from '@/components/ai-hub/content-generation-panel';
import { ContentOptimizer } from '@/components/ai-hub/content-optimizer';
import { HashtagGenerator } from '@/components/ai-hub/hashtag-generator';
import { BrandVoiceTrainer } from '@/components/ai-hub/brand-voice-trainer';
import { StrategyAssistant } from '@/components/ai-hub/strategy-assistant';
import { AutomationSettings } from '@/components/ai-hub/automation-settings';
import { AICostTracker } from '@/components/ai-hub/ai-cost-tracker';

// Mock data for activity feed
const activityFeed = [
  {
    id: 1,
    agent: 'Content Creator',
    action: 'Generated 5 Instagram captions',
    time: '2 minutes ago',
    status: 'completed',
    icon: CheckCircle
  },
  {
    id: 2,
    agent: 'Engagement Agent',
    action: 'Responded to 12 customer messages',
    time: '5 minutes ago',
    status: 'completed',
    icon: CheckCircle
  },
  {
    id: 3,
    agent: 'Strategy Agent',
    action: 'Optimized posting schedule',
    time: '15 minutes ago',
    status: 'completed',
    icon: CheckCircle
  },
  {
    id: 4,
    agent: 'Trend Detection',
    action: 'Identified new trending hashtag',
    time: '23 minutes ago',
    status: 'alert',
    icon: CheckCircle
  },
  {
    id: 5,
    agent: 'Analytics Agent',
    action: 'Processing weekly metrics',
    time: '1 hour ago',
    status: 'in-progress',
    icon: Activity
  }
];

export default function AIHubPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Hub</h1>
          <p className="text-gray-400">AI-powered content creation and optimization</p>
        </div>
        <Badge variant="success" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-2" />
          5 Agents Active
        </Badge>
      </div>

      {/* AI Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">AI Budget Used</p>
                <p className="text-2xl font-bold text-white">$127.50</p>
                <p className="text-xs text-gray-500">of $500.00</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">6,193</p>
                <p className="text-xs text-green-400">+23% this week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">1.2s</p>
                <p className="text-xs text-green-400">-0.3s improved</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <p className="text-xs text-green-400">+1.2% this week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="glass-card border border-white/10">
          <TabsTrigger value="agents">Agent Status</TabsTrigger>
          <TabsTrigger value="generate">Content Generation</TabsTrigger>
          <TabsTrigger value="optimize">Optimizer</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="brand">Brand Voice</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <AgentStatusPanel />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <ContentGenerationPanel />
        </TabsContent>

        <TabsContent value="optimize" className="space-y-6">
          <ContentOptimizer />
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-6">
          <HashtagGenerator />
        </TabsContent>

        <TabsContent value="brand" className="space-y-6">
          <BrandVoiceTrainer />
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <StrategyAssistant />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <AutomationSettings />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <AICostTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}