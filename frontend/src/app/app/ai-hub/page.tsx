'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Bot,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Target,
  Users,
  Twitter,
  Instagram,
  Linkedin,
  Check,
  X,
  Zap,
  Settings,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Agent, AgentType } from '@/types/api';

const agentTypes = [
  {
    type: 'content_creator' as AgentType,
    name: 'Content Creator',
    icon: Sparkles,
    description: 'Creates engaging posts and content',
    color: 'from-purple-500 to-pink-500',
  },
  {
    type: 'strategy' as AgentType,
    name: 'Strategy Advisor',
    icon: Target,
    description: 'Plans content strategy and campaigns',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'engagement' as AgentType,
    name: 'Engagement Manager',
    icon: MessageSquare,
    description: 'Manages comments and interactions',
    color: 'from-green-500 to-emerald-500',
  },
  {
    type: 'analytics' as AgentType,
    name: 'Analytics Expert',
    icon: BarChart3,
    description: 'Analyzes performance and metrics',
    color: 'from-orange-500 to-red-500',
  },
  {
    type: 'trend_detection' as AgentType,
    name: 'Trend Detector',
    icon: TrendingUp,
    description: 'Identifies trending topics',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    type: 'competitor_analysis' as AgentType,
    name: 'Competitor Analyst',
    icon: Users,
    description: 'Monitors competitor activity',
    color: 'from-indigo-500 to-purple-500',
  },
];

const personalityPresets = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal, data-driven, and authoritative',
    config: { tone: 'professional', style: 'formal', creativity: 0.4, formality: 0.9, humor: 0.2 },
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, conversational, and approachable',
    config: { tone: 'friendly', style: 'conversational', creativity: 0.6, formality: 0.4, humor: 0.7 },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Innovative, bold, and imaginative',
    config: { tone: 'creative', style: 'bold', creativity: 0.9, formality: 0.3, humor: 0.6 },
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'Objective, precise, and data-focused',
    config: { tone: 'analytical', style: 'precise', creativity: 0.3, formality: 0.8, humor: 0.1 },
  },
];

const platformIcons = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

export default function AIHubPage() {
  const [mounted, setMounted] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [creationMode, setCreationMode] = useState<'select' | 'instant' | 'detailed' | null>(null);
  const [instantStep, setInstantStep] = useState(1);
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, agentsData] = await Promise.all([
        apiClient.client.get('/social-accounts'),
        apiClient.getAgents(),
      ]);
      setSocialAccounts(accountsData.data);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = (account: any) => {
    setSelectedAccount(account);
    setShowCreateModal(true);
    setCreationMode('select');
    setInstantStep(1);
    setSelectedType(null);
    setSelectedPersonality(null);
  };

  const handleInstantCreate = async () => {
    if (!selectedAccount || !selectedType) return;

    try {
      setCreating(true);
      const newAgent = await apiClient.createAgentInstant({
        socialAccountId: selectedAccount.id,
        type: selectedType,
      });

      // If personality preset selected, update the agent
      if (selectedPersonality) {
        const preset = personalityPresets.find(p => p.id === selectedPersonality);
        if (preset) {
          await apiClient.updateAgentConfig(newAgent.id, {
            personalityConfig: preset.config,
          });
        }
      }

      toast.success('Agent created successfully!');
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAgent = async (agent: Agent) => {
    try {
      if (agent.active) {
        await apiClient.deactivateAgent(agent.id);
        toast.success('Agent deactivated');
      } else {
        await apiClient.activateAgent(agent.id);
        toast.success('Agent activated');
      }
      loadData();
    } catch (error) {
      toast.error('Failed to toggle agent');
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!confirm(`Delete ${agent.name}?`)) return;

    try {
      await apiClient.client.delete(`/agents/${agent.id}`);
      toast.success('Agent deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const getAgentsForAccount = (accountId: string) => {
    // Filter agents by social account ID and remove duplicates by ID
    const filtered = agents.filter(a => a.socialAccountId === accountId);
    const uniqueAgents = filtered.reduce((acc, agent) => {
      if (!acc.find(a => a.id === agent.id)) {
        acc.push(agent);
      }
      return acc;
    }, [] as Agent[]);
    return uniqueAgents;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Hub
          </h1>
          <p className="text-gray-600">Manage your AI agents for each social account</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : socialAccounts.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="py-12 text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Social Accounts Connected</h3>
            <p className="text-gray-600 mb-4">Connect a social account to create AI agents</p>
            <Button
              onClick={() => (window.location.href = '/app/settings')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              Connect Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {socialAccounts.map(account => {
            const accountAgents = getAgentsForAccount(account.id);
            const PlatformIcon = platformIcons[account.platform as keyof typeof platformIcons] || Bot;

            return (
              <Card key={account.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <PlatformIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">
                          {account.displayName || account.platform}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {accountAgents.length} agent{accountAgents.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCreateAgent(account)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Agent
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {accountAgents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No agents yet. Create one to get started!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {accountAgents.map(agent => {
                        const agentType = agentTypes.find(t => t.type === agent.type);
                        const AgentIcon = agentType?.icon || Bot;

                        return (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${agentType?.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                <AgentIcon className="w-6 h-6 text-white" />
                              </div>
                              <Badge className={agent.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                                {agent.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-1 text-lg">{agent.name}</h4>
                            <p className="text-sm text-gray-600 mb-4">{agentType?.description}</p>
                            
                            {/* Agent Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Tasks</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {agent.usageStats?.totalTasks || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Cost</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ${(agent.usageStats?.totalCost || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Model Info */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-1">AI Model</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {agent.aiProvider}
                                </Badge>
                                <span className="text-xs text-gray-600">{agent.model}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleAgent(agent)}
                                className="flex-1"
                              >
                                {agent.active ? (
                                  <>
                                    <PowerOff className="w-3.5 h-3.5 mr-1.5" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-3.5 h-3.5 mr-1.5" />
                                    Activate
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAgent(agent)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Mode Selection */}
              {creationMode === 'select' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create AI Agent</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-8">Choose how you want to create your agent</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCreationMode('instant')}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                    >
                      <Zap className="w-8 h-8 text-indigo-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Instant Mode</h3>
                      <p className="text-sm text-gray-600">Quick setup with smart defaults and personality presets</p>
                    </button>

                    <button
                      onClick={() => setCreationMode('detailed')}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                    >
                      <Settings className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Detailed Mode</h3>
                      <p className="text-sm text-gray-600">Customize everything via chat interface (Coming Soon)</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Instant Mode - Step 1: Select Type */}
              {creationMode === 'instant' && instantStep === 1 && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Select Agent Type</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                          <span className="text-sm font-medium text-gray-900">Choose Type</span>
                        </div>
                        <div className="w-12 h-0.5 bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">2</div>
                          <span className="text-sm text-gray-500">Personality</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setCreationMode('select')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {agentTypes.map(type => (
                      <button
                        key={type.type}
                        onClick={() => setSelectedType(type.type)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedType === type.type
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <type.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{type.name}</h4>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                          {selectedType === type.type && (
                            <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setCreationMode('select')}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setInstantStep(2)}
                      disabled={!selectedType}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Instant Mode - Step 2: Select Personality */}
              {creationMode === 'instant' && instantStep === 2 && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Choose Personality</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                            <Check className="w-5 h-5" />
                          </div>
                          <span className="text-sm text-gray-500">Choose Type</span>
                        </div>
                        <div className="w-12 h-0.5 bg-indigo-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                          <span className="text-sm font-medium text-gray-900">Personality</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">Optional - Skip to use defaults</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {personalityPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPersonality(preset.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPersonality === preset.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                          {selectedPersonality === preset.id && (
                            <Check className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="text-xs">Creativity: {preset.config.creativity}</Badge>
                          <Badge className="text-xs">Formality: {preset.config.formality}</Badge>
                          <Badge className="text-xs">Humor: {preset.config.humor}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setInstantStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleInstantCreate}
                      disabled={creating}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      {creating ? 'Creating...' : 'Create Agent'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Detailed Mode - Coming Soon */}
              {creationMode === 'detailed' && (
                <div className="p-8 text-center">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600 mb-6">
                    Chat-based agent personalization will be available soon!
                  </p>
                  <Button variant="outline" onClick={() => setCreationMode('select')}>
                    Back
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
