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
  },
  {
    type: 'strategy' as AgentType,
    name: 'Strategy Advisor',
    icon: Target,
    description: 'Plans content strategy and campaigns',
  },
  {
    type: 'engagement' as AgentType,
    name: 'Engagement Manager',
    icon: MessageSquare,
    description: 'Manages comments and interactions',
  },
  {
    type: 'analytics' as AgentType,
    name: 'Analytics Expert',
    icon: BarChart3,
    description: 'Analyzes performance and metrics',
  },
  {
    type: 'trend_detection' as AgentType,
    name: 'Trend Detector',
    icon: TrendingUp,
    description: 'Identifies trending topics',
  },
  {
    type: 'competitor_analysis' as AgentType,
    name: 'Competitor Analyst',
    icon: Users,
    description: 'Monitors competitor activity',
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
    <>
    <div className="min-h-screen bg-page p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
            AI Hub
          </h1>
          <p className="text-sm text-gray-500">Manage your AI agents</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900"></div>
        </div>
      ) : socialAccounts.length === 0 ? (
        <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
          <CardContent className="py-16 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 mb-2">No Social Accounts Connected</h3>
            <p className="text-sm text-gray-500 mb-6">Connect a social account to create AI agents</p>
            <Button
              onClick={() => (window.location.href = '/app/settings')}
              className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none"
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
              <Card key={account.id} className="bg-gray-50/50 border border-gray-100 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <PlatformIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium text-gray-900">
                          {account.displayName || account.platform}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">
                          {accountAgents.length} agent{accountAgents.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCreateAgent(account)}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none min-h-[44px] sm:min-h-[36px] whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden xs:inline">Create Agent</span>
                      <span className="xs:hidden">Create</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {accountAgents.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                      No agents yet. Create one to get started!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {accountAgents.map(agent => {
                        const agentType = agentTypes.find(t => t.type === agent.type);
                        const AgentIcon = agentType?.icon || Bot;

                        return (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                <AgentIcon className="w-5 h-5 text-white" />
                              </div>
                              <Badge className={agent.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
                                {agent.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <h4 className="text-sm font-medium text-gray-900 mb-1">{agent.name}</h4>
                            <p className="text-xs text-gray-500 mb-4">{agentType?.description}</p>

                            {/* Agent Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Tasks</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {agent.usageStats?.totalTasks || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Cost</p>
                                <p className="text-sm font-medium text-gray-900">
                                  ${(agent.usageStats?.totalCost || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Model Info */}
                            <div className="mb-4 pb-4 border-b border-gray-100">
                              <p className="text-xs text-gray-400 mb-2">AI Model</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white">
                                  {agent.aiProvider}
                                </Badge>
                                <span className="text-xs text-gray-500">{agent.model}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleAgent(agent)}
                                className="flex-1 text-xs"
                              >
                                {agent.active ? (
                                  <>
                                    <PowerOff className="w-3 h-3 mr-1.5" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-3 h-3 mr-1.5" />
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
                                <Trash2 className="w-3 h-3" />
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
    </div>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto border border-gray-200"
            >
              {/* Mode Selection */}
              {creationMode === 'select' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Create AI Agent</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">Choose how you want to create your agent</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCreationMode('instant')}
                      className="p-6 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
                    >
                      <Zap className="w-6 h-6 text-gray-900 mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Instant Mode</h3>
                      <p className="text-xs text-gray-500">Quick setup with smart defaults and personality presets</p>
                    </button>

                    <button
                      onClick={() => setCreationMode('detailed')}
                      className="p-6 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
                    >
                      <Settings className="w-6 h-6 text-gray-900 mb-3" />
                      <h3 className="font-medium text-gray-900 mb-2">Detailed Mode</h3>
                      <p className="text-xs text-gray-500">Customize everything via chat interface (Coming Soon)</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Instant Mode - Step 1: Select Type */}
              {creationMode === 'instant' && instantStep === 1 && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Select Agent Type</h2>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">1</div>
                          <span className="text-xs font-medium text-gray-900">Choose Type</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-medium">2</div>
                          <span className="text-xs text-gray-400">Personality</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setCreationMode('select')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {agentTypes.map(type => (
                      <button
                        key={type.type}
                        onClick={() => setSelectedType(type.type)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          selectedType === type.type
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1 text-sm">{type.name}</h4>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                          {selectedType === type.type && (
                            <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setCreationMode('select')}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setInstantStep(2)}
                      disabled={!selectedType}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none"
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
                      <h2 className="text-lg font-medium text-gray-900">Choose Personality</h2>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-xs text-gray-400">Choose Type</span>
                        </div>
                        <div className="w-8 h-px bg-gray-900"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">2</div>
                          <span className="text-xs font-medium text-gray-900">Personality</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Optional - Skip to use defaults</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {personalityPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPersonality(preset.id)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          selectedPersonality === preset.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
                          {selectedPersonality === preset.id && (
                            <Check className="w-4 h-4 text-gray-900" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{preset.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="text-xs bg-white border-gray-200">Creativity: {preset.config.creativity}</Badge>
                          <Badge className="text-xs bg-white border-gray-200">Formality: {preset.config.formality}</Badge>
                          <Badge className="text-xs bg-white border-gray-200">Humor: {preset.config.humor}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setInstantStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleInstantCreate}
                      disabled={creating}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none"
                    >
                      {creating ? 'Creating...' : 'Create Agent'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Detailed Mode - Coming Soon */}
              {creationMode === 'detailed' && (
                <div className="p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Chat-based agent personalization will be available soon
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
    </>
  );
}
