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
  Brain,
  Cpu,
  Image,
  Hash,
  FileText,
  Wand2,
  Activity,
  Clock,
  DollarSign,
  Layers,
  Play,
  ChevronRight,
  RefreshCw,
  Eye,
  Lightbulb,
  PenTool,
  Search,
  Globe,
  Shield,
  Gauge,
  ArrowUpRight,
  Mic,
  Video,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Agent, AgentType } from '@/types/api';

const agentTypes = [
  { type: 'content_creator' as AgentType, name: 'Content Creator', icon: Sparkles, description: 'Creates engaging posts and content', color: 'emerald' },
  { type: 'strategy' as AgentType, name: 'Strategy Advisor', icon: Target, description: 'Plans content strategy and campaigns', color: 'blue' },
  { type: 'engagement' as AgentType, name: 'Engagement Manager', icon: MessageSquare, description: 'Manages comments and interactions', color: 'purple' },
  { type: 'analytics' as AgentType, name: 'Analytics Expert', icon: BarChart3, description: 'Analyzes performance and metrics', color: 'amber' },
  { type: 'trend_detection' as AgentType, name: 'Trend Detector', icon: TrendingUp, description: 'Identifies trending topics', color: 'rose' },
  { type: 'competitor_analysis' as AgentType, name: 'Competitor Analyst', icon: Users, description: 'Monitors competitor activity', color: 'cyan' },
];

const personalityPresets = [
  { id: 'professional', name: 'Professional', description: 'Formal, data-driven, and authoritative', config: { tone: 'professional', style: 'formal', creativity: 0.4, formality: 0.9, humor: 0.2 } },
  { id: 'friendly', name: 'Friendly', description: 'Warm, conversational, and approachable', config: { tone: 'friendly', style: 'conversational', creativity: 0.6, formality: 0.4, humor: 0.7 } },
  { id: 'creative', name: 'Creative', description: 'Innovative, bold, and imaginative', config: { tone: 'creative', style: 'bold', creativity: 0.9, formality: 0.3, humor: 0.6 } },
  { id: 'analytical', name: 'Analytical', description: 'Objective, precise, and data-focused', config: { tone: 'analytical', style: 'precise', creativity: 0.3, formality: 0.8, humor: 0.1 } },
];

const aiTools = [
  { id: 'caption', name: 'Caption Generator', icon: PenTool, description: 'Generate engaging captions for any platform', color: 'emerald' },
  { id: 'content', name: 'Content Writer', icon: FileText, description: 'Create long-form content and articles', color: 'blue' },
  { id: 'image', name: 'Image Generator', icon: Image, description: 'Generate AI images for your posts', color: 'purple' },
  { id: 'hashtag', name: 'Hashtag Finder', icon: Hash, description: 'Find trending and relevant hashtags', color: 'amber' },
  { id: 'improve', name: 'Content Improver', icon: Wand2, description: 'Enhance and optimize existing content', color: 'rose' },
  { id: 'sentiment', name: 'Sentiment Analyzer', icon: Activity, description: 'Analyze sentiment of your content', color: 'cyan' },
];

const aiProviders = [
  { id: 'openai', name: 'OpenAI', models: ['GPT-4 Turbo', 'GPT-4', 'GPT-3.5'], icon: '🤖' },
  { id: 'anthropic', name: 'Anthropic', models: ['Claude 3.5 Sonnet', 'Claude 3 Opus'], icon: '🧠' },
  { id: 'deepseek', name: 'DeepSeek', models: ['DeepSeek V2'], icon: '🔍' },
  { id: 'gemini', name: 'Google Gemini', models: ['Gemini Pro', 'Gemini Ultra'], icon: '✨' },
];

const platformIcons = { twitter: Twitter, instagram: Instagram, linkedin: Linkedin };

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
  const [activeTab, setActiveTab] = useState<'agents' | 'tools' | 'usage'>('agents');
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [toolLoading, setToolLoading] = useState(false);

  useEffect(() => { setMounted(true); loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, agentsData] = await Promise.all([
        apiClient.client.get('/social-accounts'),
        apiClient.getAgents()
      ]);
      setSocialAccounts(accountsData.data);
      setAgents(agentsData);
      
      // Load AI usage stats
      try {
        const usageData = await apiClient.client.get('/ai/usage');
        setAiUsage(usageData.data);
      } catch (e) {
        console.log('AI usage not available');
      }
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
      const newAgent = await apiClient.createAgentInstant({ socialAccountId: selectedAccount.id, type: selectedType });
      if (selectedPersonality) {
        const preset = personalityPresets.find(p => p.id === selectedPersonality);
        if (preset) await apiClient.updateAgentConfig(newAgent.id, { personalityConfig: preset.config });
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
      if (agent.active) { await apiClient.deactivateAgent(agent.id); toast.success('Agent deactivated'); }
      else { await apiClient.activateAgent(agent.id); toast.success('Agent activated'); }
      loadData();
    } catch (error) { toast.error('Failed to toggle agent'); }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!confirm(`Delete ${agent.name}?`)) return;
    try { await apiClient.client.delete(`/agents/${agent.id}`); toast.success('Agent deleted'); loadData(); }
    catch (error) { toast.error('Failed to delete agent'); }
  };

  const handleToolUse = async () => {
    if (!selectedTool || !toolInput.trim()) return;
    setToolLoading(true);
    setToolOutput(null);
    
    try {
      let response;
      switch (selectedTool) {
        case 'caption':
          response = await apiClient.client.post('/ai/generate/caption', { topic: toolInput, variations: 3 });
          setToolOutput({ type: 'captions', data: response.data.captions });
          break;
        case 'content':
          response = await apiClient.client.post('/ai/generate/content', { prompt: toolInput });
          setToolOutput({ type: 'content', data: response.data.content });
          break;
        case 'hashtag':
          response = await apiClient.client.post('/ai/generate/hashtags', { content: toolInput, count: 15 });
          setToolOutput({ type: 'hashtags', data: response.data.hashtags });
          break;
        case 'improve':
          response = await apiClient.client.post('/ai/improve', { content: toolInput });
          setToolOutput({ type: 'improved', data: response.data });
          break;
        default:
          toast.error('Tool not implemented yet');
      }
      toast.success('Generated successfully!');
    } catch (error: any) {
      console.error('Tool error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate');
    } finally {
      setToolLoading(false);
    }
  };

  const getAgentsForAccount = (accountId: string) => {
    const filtered = agents.filter(a => a.socialAccountId === accountId);
    return filtered.reduce((acc, agent) => { if (!acc.find(a => a.id === agent.id)) acc.push(agent); return acc; }, [] as Agent[]);
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.active).length;
  const totalTasks = agents.reduce((sum, a) => sum + (a.usageStats?.totalTasks || 0), 0);
  const totalCost = agents.reduce((sum, a) => sum + (a.usageStats?.totalCost || 0), 0);

  if (!mounted) return null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">AI Hub</h1>
              <p className="text-sm text-gray-500">Intelligent automation for your social media</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadData} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { id: 'agents', label: 'AI Agents', icon: Bot },
            { id: 'tools', label: 'AI Tools', icon: Wand2 },
            { id: 'usage', label: 'Usage & Billing', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* AI Agents Tab */}
        {activeTab === 'agents' && (
          <>
            {loading ? (
              <motion.div className="flex flex-col items-center justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 animate-pulse">
                  <Cpu className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Loading your AI agents...</p>
              </motion.div>
            ) : socialAccounts.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Bot className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Social Accounts Connected</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">Connect your social media accounts to start creating powerful AI agents.</p>
                    <Button onClick={() => (window.location.href = '/app/settings')} className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm px-8 h-11">
                      Connect Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Agent Types Overview */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-semibold text-gray-900">Available Agent Types</CardTitle>
                      <CardDescription className="text-xs text-gray-500">Choose from 6 specialized AI agents for different tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {agentTypes.map((type, index) => {
                          const count = agents.filter(a => a.type === type.type).length;
                          return (
                            <motion.div
                              key={type.type}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all cursor-pointer group"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${type.color}-50 group-hover:bg-${type.color}-100 transition-colors`}>
                                <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                              </div>
                              <h4 className="text-xs font-semibold text-gray-900 mb-1">{type.name}</h4>
                              <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{type.description}</p>
                              <Badge className="text-[10px] bg-gray-100 border-gray-200 text-gray-600">{count} active</Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Social Accounts with Agents */}
                {socialAccounts.map((account, accountIndex) => {
                  const accountAgents = getAgentsForAccount(account.id);
                  const PlatformIcon = platformIcons[account.platform as keyof typeof platformIcons] || Bot;
                  return (
                    <motion.div key={account.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + accountIndex * 0.1 }}>
                      <Card className="bg-white border border-gray-100 shadow-sm">
                        <CardHeader className="pb-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <PlatformIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-semibold text-gray-900">{account.displayName || account.platform}</CardTitle>
                                <CardDescription className="text-xs text-gray-500">{accountAgents.length} agent{accountAgents.length !== 1 ? 's' : ''} • @{account.username || account.platform}</CardDescription>
                              </div>
                            </div>
                            <Button onClick={() => handleCreateAgent(account)} className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm h-10 px-4">
                              <Plus className="w-4 h-4 mr-2" />Create Agent
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-5">
                          {accountAgents.length === 0 ? (
                            <div className="text-center py-12 text-sm text-gray-500">
                              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Bot className="w-7 h-7 text-gray-400" />
                              </div>
                              No agents yet. Create one to get started!
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {accountAgents.map((agent, agentIndex) => {
                                const agentType = agentTypes.find(t => t.type === agent.type);
                                const AgentIcon = agentType?.icon || Bot;
                                return (
                                  <motion.div key={agent.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: agentIndex * 0.05 }} whileHover={{ y: -4 }} className="group">
                                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all">
                                      <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.active ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                          <AgentIcon className="w-5 h-5" />
                                        </div>
                                        <Badge className={`${agent.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'} text-[10px] font-bold px-2 py-1`}>
                                          {agent.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </div>
                                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{agent.name}</h4>
                                      <p className="text-xs text-gray-500 mb-4">{agentType?.description}</p>
                                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-100">
                                        <div><p className="text-[10px] text-gray-400 mb-1">Tasks</p><p className="text-sm font-semibold text-gray-900">{agent.usageStats?.totalTasks || 0}</p></div>
                                        <div><p className="text-[10px] text-gray-400 mb-1">Cost</p><p className="text-sm font-semibold text-gray-900">${(agent.usageStats?.totalCost || 0).toFixed(2)}</p></div>
                                      </div>
                                      <div className="mb-4 pb-4 border-b border-gray-100">
                                        <p className="text-[10px] text-gray-400 mb-2">AI Model</p>
                                        <div className="flex items-center gap-2">
                                          <Badge className="text-[10px] bg-gray-100 border-gray-200 text-gray-600">{agent.aiProvider}</Badge>
                                          <span className="text-[10px] text-gray-500">{agent.model}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleToggleAgent(agent)} className="flex-1 text-xs bg-white border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg h-9">
                                          {agent.active ? <><PowerOff className="w-3 h-3 mr-1.5" />Pause</> : <><Power className="w-3 h-3 mr-1.5" />Activate</>}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDeleteAgent(agent)} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200 rounded-lg h-9 w-9 p-0">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Quick AI Tools */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Quick AI Tools</CardTitle>
                <CardDescription className="text-xs text-gray-500">Generate content instantly with our AI-powered tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {aiTools.map((tool, index) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() => { setSelectedTool(tool.id); setShowToolModal(true); setToolInput(''); setToolOutput(null); }}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${tool.color}-50 group-hover:bg-${tool.color}-100 transition-colors`}>
                        <tool.icon className={`w-5 h-5 text-${tool.color}-500`} />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">{tool.name}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{tool.description}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Providers */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Supported AI Providers</CardTitle>
                <CardDescription className="text-xs text-gray-500">Choose from multiple AI providers for your agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aiProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{provider.icon}</span>
                        <h4 className="text-sm font-semibold text-gray-900">{provider.name}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((model) => (
                          <Badge key={model} className="text-[10px] bg-white border-gray-200 text-gray-600">{model}</Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900">Content Generation</CardTitle>
                  <CardDescription className="text-xs text-gray-500">AI-powered content creation capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: PenTool, label: 'Platform-optimized captions', desc: 'Twitter, LinkedIn, Instagram, TikTok' },
                    { icon: FileText, label: 'Long-form content', desc: 'Articles, threads, and stories' },
                    { icon: Image, label: 'AI image generation', desc: 'DALL-E powered visuals' },
                    { icon: Hash, label: 'Smart hashtag research', desc: 'Trending and niche hashtags' },
                    { icon: Globe, label: 'Multi-language support', desc: 'Content in 50+ languages' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900">Analytics & Insights</CardTitle>
                  <CardDescription className="text-xs text-gray-500">AI-driven analytics capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: BarChart3, label: 'Performance analysis', desc: 'Deep metrics insights' },
                    { icon: TrendingUp, label: 'Trend detection', desc: 'Real-time trend monitoring' },
                    { icon: Users, label: 'Competitor analysis', desc: 'Benchmark against competitors' },
                    { icon: Activity, label: 'Sentiment analysis', desc: 'Understand audience sentiment' },
                    { icon: Lightbulb, label: 'Strategic recommendations', desc: 'AI-powered suggestions' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Usage & Billing Tab */}
        {activeTab === 'usage' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">This Month</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total AI Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{aiUsage?.totalRequests || totalTasks}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">vs last month</span>
                      <span className="text-emerald-500 font-medium">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-blue-500" />
                    </div>
                    <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Tokens</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Tokens Used</p>
                  <p className="text-2xl font-bold text-gray-900">{((aiUsage?.totalTokens || 0) / 1000).toFixed(1)}K</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Avg per request</span>
                      <span className="text-gray-900 font-medium">{Math.round((aiUsage?.totalTokens || 0) / Math.max(aiUsage?.totalRequests || 1, 1))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                    </div>
                    <Badge className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">Cost</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900">${(aiUsage?.totalCost || totalCost).toFixed(2)}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Budget remaining</span>
                      <span className="text-emerald-500 font-medium">$47.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage by Type */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Usage by Request Type</CardTitle>
                <CardDescription className="text-xs text-gray-500">Breakdown of AI requests by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Caption Generation', count: aiUsage?.byType?.caption_generation?.count || 45, cost: aiUsage?.byType?.caption_generation?.cost || 2.34, color: 'emerald', percent: 35 },
                    { type: 'Content Generation', count: aiUsage?.byType?.content_generation?.count || 28, cost: aiUsage?.byType?.content_generation?.cost || 4.56, color: 'blue', percent: 25 },
                    { type: 'Image Generation', count: aiUsage?.byType?.image_generation?.count || 15, cost: aiUsage?.byType?.image_generation?.cost || 3.00, color: 'purple', percent: 20 },
                    { type: 'Hashtag Generation', count: aiUsage?.byType?.hashtag_generation?.count || 32, cost: aiUsage?.byType?.hashtag_generation?.cost || 0.89, color: 'amber', percent: 12 },
                    { type: 'Content Improvement', count: aiUsage?.byType?.content_improvement?.count || 12, cost: aiUsage?.byType?.content_improvement?.cost || 1.23, color: 'rose', percent: 8 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-xs font-medium text-gray-900">{item.type}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                      <div className="w-16 text-right text-xs text-gray-500">{item.count} req</div>
                      <div className="w-16 text-right text-xs font-medium text-gray-900">${item.cost.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Usage */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Agent Performance</CardTitle>
                <CardDescription className="text-xs text-gray-500">Usage statistics for each AI agent</CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No agents created yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.map((agent) => {
                      const agentType = agentTypes.find(t => t.type === agent.type);
                      const AgentIcon = agentType?.icon || Bot;
                      return (
                        <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.active ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <AgentIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agentType?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{agent.usageStats?.totalTasks || 0} tasks</p>
                            <p className="text-xs text-gray-500">${(agent.usageStats?.totalCost || 0).toFixed(2)}</p>
                          </div>
                          <Badge className={`${agent.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'} text-[10px]`}>
                            {agent.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Settings */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Budget & Limits</CardTitle>
                <CardDescription className="text-xs text-gray-500">Manage your AI spending limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Monthly Budget</span>
                      <span className="text-sm font-bold text-gray-900">$50.00</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>$22.50 used</span>
                      <span>$27.50 remaining</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700">Budget alerts</span>
                      </div>
                      <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-700">Auto-pause at limit</span>
                      </div>
                      <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {creationMode === 'select' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Create AI Agent</h2>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Choose how you want to create your agent</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setCreationMode('instant')} className="p-5 rounded-xl border border-gray-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Instant Mode</h3>
                      <p className="text-xs text-gray-500">Quick setup with smart defaults</p>
                    </button>
                    <button onClick={() => setCreationMode('detailed')} className="p-5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Detailed Mode</h3>
                      <p className="text-xs text-gray-500">Customize via chat (Coming Soon)</p>
                    </button>
                  </div>
                </div>
              )}

              {creationMode === 'instant' && instantStep === 1 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">Select Agent Type</h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">1</div><span className="text-xs font-medium text-gray-900">Choose Type</span></div>
                        <div className="w-8 h-px bg-gray-200"></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-medium">2</div><span className="text-xs text-gray-500">Personality</span></div>
                      </div>
                    </div>
                    <button onClick={() => setCreationMode('select')} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {agentTypes.map((type) => (
                      <button key={type.type} onClick={() => setSelectedType(type.type)} className={`p-4 rounded-xl border transition-all text-left ${selectedType === type.type ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedType === type.type ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            <type.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 text-sm">{type.name}</h4>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                          {selectedType === type.type && <Check className="w-5 h-5 text-emerald-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setCreationMode('select')} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700">Back</Button>
                    <Button onClick={() => setInstantStep(2)} disabled={!selectedType} className="bg-gray-900 hover:bg-gray-800 text-white">Next</Button>
                  </div>
                </div>
              )}

              {creationMode === 'instant' && instantStep === 2 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">Choose Personality</h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="w-3 h-3" /></div><span className="text-xs text-gray-500">Choose Type</span></div>
                        <div className="w-8 h-px bg-emerald-500"></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</div><span className="text-xs font-medium text-gray-900">Personality</span></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Optional - Skip to use defaults</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {personalityPresets.map((preset) => (
                      <button key={preset.id} onClick={() => setSelectedPersonality(preset.id)} className={`p-4 rounded-xl border transition-all text-left ${selectedPersonality === preset.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{preset.name}</h4>
                          {selectedPersonality === preset.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{preset.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="text-[10px] bg-gray-100 border-gray-200 text-gray-600">Creativity: {preset.config.creativity}</Badge>
                          <Badge className="text-[10px] bg-gray-100 border-gray-200 text-gray-600">Formality: {preset.config.formality}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setInstantStep(1)} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700">Back</Button>
                    <Button onClick={handleInstantCreate} disabled={creating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      {creating ? 'Creating...' : 'Create Agent'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Tool Modal */}
      <AnimatePresence>
        {showToolModal && selectedTool && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      {(() => {
                        const tool = aiTools.find(t => t.id === selectedTool);
                        const ToolIcon = tool?.icon || Wand2;
                        return <ToolIcon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{aiTools.find(t => t.id === selectedTool)?.name}</h2>
                      <p className="text-xs text-gray-500">{aiTools.find(t => t.id === selectedTool)?.description}</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowToolModal(false); setToolOutput(null); }} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Input Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {selectedTool === 'caption' && 'Enter your topic or idea'}
                    {selectedTool === 'content' && 'Describe what content you want to create'}
                    {selectedTool === 'hashtag' && 'Enter your content or topic'}
                    {selectedTool === 'improve' && 'Paste your content to improve'}
                    {selectedTool === 'image' && 'Describe the image you want to generate'}
                    {selectedTool === 'sentiment' && 'Enter text to analyze'}
                  </label>
                  <textarea
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    placeholder={
                      selectedTool === 'caption' ? 'e.g., New product launch for eco-friendly water bottles...' :
                      selectedTool === 'content' ? 'e.g., Write a LinkedIn post about remote work productivity tips...' :
                      selectedTool === 'hashtag' ? 'e.g., Just launched our new sustainable fashion line...' :
                      selectedTool === 'improve' ? 'Paste your existing content here...' :
                      selectedTool === 'image' ? 'e.g., A modern office space with plants and natural lighting...' :
                      'Enter text to analyze...'
                    }
                    className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none text-sm"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleToolUse}
                  disabled={toolLoading || !toolInput.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 mb-6"
                >
                  {toolLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>

                {/* Output Section */}
                {toolOutput && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Generated Results</h3>
                    
                    {toolOutput.type === 'captions' && (
                      <div className="space-y-3">
                        {toolOutput.data.map((caption: string, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm text-gray-700 flex-1">{caption}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { navigator.clipboard.writeText(caption); toast.success('Copied!'); }}
                                className="flex-shrink-0 h-8 px-3 text-xs"
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {toolOutput.type === 'content' && (
                      <div className="space-y-3">
                        {toolOutput.data.map((content: string, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { navigator.clipboard.writeText(content); toast.success('Copied!'); }}
                                className="h-8 px-3 text-xs"
                              >
                                Copy Content
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {toolOutput.type === 'hashtags' && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {toolOutput.data.map((hashtag: string, i: number) => (
                            <Badge key={i} className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200 cursor-pointer hover:bg-emerald-100" onClick={() => { navigator.clipboard.writeText(hashtag); toast.success('Copied!'); }}>
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { navigator.clipboard.writeText(toolOutput.data.join(' ')); toast.success('All hashtags copied!'); }}
                          className="h-8 px-3 text-xs"
                        >
                          Copy All Hashtags
                        </Button>
                      </div>
                    )}

                    {toolOutput.type === 'improved' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Improved Content</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{toolOutput.data.improvedContent}</p>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { navigator.clipboard.writeText(toolOutput.data.improvedContent); toast.success('Copied!'); }}
                              className="h-8 px-3 text-xs"
                            >
                              Copy Improved Content
                            </Button>
                          </div>
                        </div>
                        {toolOutput.data.suggestions && toolOutput.data.suggestions.length > 0 && (
                          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-xs font-medium text-blue-700 mb-2">Suggestions</p>
                            <ul className="space-y-1">
                              {toolOutput.data.suggestions.map((suggestion: string, i: number) => (
                                <li key={i} className="text-xs text-blue-600 flex items-start gap-2">
                                  <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
