'use client';

import { useState } from 'react';
import { Brain, Target, MessageSquare, BarChart3, TrendingUp, Users, Play, Pause, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'active' | 'idle' | 'paused';
  performance: number;
  tasksCompleted: number;
  color: string;
  currentTask: string;
}

export function AgentStatusPanel() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'content-creator',
      name: 'Content Creator',
      description: 'Generates engaging content',
      icon: Brain,
      status: 'active',
      performance: 94,
      tasksCompleted: 1247,
      color: 'from-purple-500 to-pink-500',
      currentTask: 'Creating Instagram carousel',
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      description: 'Analyzes and optimizes strategy',
      icon: Target,
      status: 'active',
      performance: 89,
      tasksCompleted: 892,
      color: 'from-blue-500 to-cyan-500',
      currentTask: 'Analyzing competitor content',
    },
    {
      id: 'engagement',
      name: 'Engagement Agent',
      description: 'Monitors social interactions',
      icon: MessageSquare,
      status: 'active',
      performance: 96,
      tasksCompleted: 2156,
      color: 'from-green-500 to-emerald-500',
      currentTask: 'Responding to inquiries',
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      description: 'Processes data and insights',
      icon: BarChart3,
      status: 'idle',
      performance: 91,
      tasksCompleted: 743,
      color: 'from-orange-500 to-red-500',
      currentTask: 'Generating weekly report',
    },
    {
      id: 'trend',
      name: 'Trend Detection',
      description: 'Identifies trending topics',
      icon: TrendingUp,
      status: 'active',
      performance: 87,
      tasksCompleted: 634,
      color: 'from-indigo-500 to-purple-500',
      currentTask: 'Monitoring industry trends',
    },
    {
      id: 'competitor',
      name: 'Competitor Analysis',
      description: 'Tracks competitor activities',
      icon: Users,
      status: 'active',
      performance: 92,
      tasksCompleted: 521,
      color: 'from-pink-500 to-rose-500',
      currentTask: 'Analyzing posting patterns',
    },
  ]);

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          status: agent.status === 'active' ? 'paused' : 'active',
        };
      }
      return agent;
    }));
  };

  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">AI Agents</CardTitle>
            <CardDescription className="text-gray-400">
              Your AI team working 24/7
            </CardDescription>
          </div>
          <Badge variant="success" className="px-3 py-1">
            {activeAgents} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                className="p-4 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${agent.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={agent.status === 'active' ? 'success' : agent.status === 'idle' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {agent.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAgentStatus(agent.id)}
                    >
                      {agent.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{agent.description}</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white">{agent.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${agent.color}`}
                      style={{ width: `${agent.performance}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  Current: {agent.currentTask}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Tasks: {agent.tasksCompleted.toLocaleString()}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
