'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Brain,
	Target,
	MessageSquare,
	BarChart3,
	TrendingUp,
	Users,
	Play,
	Pause,
	Settings,
	Zap,
	Activity,
	DollarSign,
	CheckCircle,
	Loader2,
	Plus,
	X,
	Sparkles,
	ArrowRight,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	useAgents,
	useAgentStatistics,
	useAgentActivity,
	useActivateAgent,
	useDeactivateAgent,
} from '@/hooks';

const agentTemplates = [
	{
		type: 'content_creator',
		name: 'Content Creator',
		description: 'Generate engaging posts and captions for your social media',
		icon: Brain,
		features: ['AI-powered captions', 'Hashtag suggestions', 'Multi-platform'],
	},
	{
		type: 'strategy',
		name: 'Strategy Agent',
		description: 'Analyze trends and optimize your content strategy',
		icon: Target,
		features: ['Trend analysis', 'Best time to post', 'Competitor insights'],
	},
	{
		type: 'engagement',
		name: 'Engagement Agent',
		description: 'Monitor and respond to comments and messages',
		icon: MessageSquare,
		features: ['Auto-responses', 'Sentiment analysis', '24/7 monitoring'],
	},
	{
		type: 'analytics',
		name: 'Analytics Agent',
		description: 'Track performance and generate insights',
		icon: BarChart3,
		features: ['Performance tracking', 'Custom reports', 'ROI analysis'],
	},
];

export default function AIHubPage() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [step, setStep] = useState(1);

	const {
		data: agents = [],
		isLoading: agentsLoading,
		refetch: refetchAgents,
	} = useAgents();
	const { data: statistics } = useAgentStatistics();
	const { data: activityFeed = [] } = useAgentActivity();
	const activateAgent = useActivateAgent();
	const deactivateAgent = useDeactivateAgent();

	const handleToggleAgent = async (
		agentId: string,
		currentStatus: boolean
	) => {
		if (currentStatus) {
			deactivateAgent.mutate(agentId);
		} else {
			activateAgent.mutate(agentId);
		}
	};

	if (agentsLoading && agents.length === 0) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Loading AI agents...</p>
				</div>
			</div>
		);
	}

	const activeAgentsCount = agents.filter((a: any) => a.active).length;
	const totalBudgetUsed = statistics?.totalCost || 0;
	const totalTasks = statistics?.totalTasks || 0;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-semibold text-gray-900 mb-1">
							AI Hub
						</h1>
						<p className="text-gray-600">
							Manage your AI agents and automation
						</p>
					</div>
					<Button
						className="bg-blue-600 hover:bg-blue-700 text-white"
						onClick={() => setShowCreateModal(true)}
					>
						<Plus className="w-4 h-4 mr-2" />
						Create Agent
					</Button>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[
						{
							label: 'Active Agents',
							value: `${activeAgentsCount}/${agents.length}`,
							icon: Brain,
						},
						{
							label: 'Tasks Completed',
							value: totalTasks.toLocaleString(),
							icon: CheckCircle,
						},
						{
							label: 'Budget Used',
							value: `$${totalBudgetUsed.toFixed(2)}`,
							icon: DollarSign,
						},
						{ label: 'Success Rate', value: '98.5%', icon: Target },
					].map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
						>
							<Card className="border-gray-200">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-2">
										<stat.icon className="w-5 h-5 text-gray-600" />
									</div>
									<p className="text-2xl font-semibold text-gray-900 mb-1">
										{stat.value}
									</p>
									<p className="text-sm text-gray-600">{stat.label}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* Empty State or Agents Grid */}
				{agents.length === 0 ? (
					<Card className="border-gray-200">
						<CardContent className="p-12 text-center">
							<div className="max-w-md mx-auto">
								<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Brain className="w-8 h-8 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									No AI Agents Yet
								</h3>
								<p className="text-gray-600 mb-6">
									Create your first AI agent to automate your social media tasks
									and boost productivity.
								</p>
								<Button
									className="bg-blue-600 hover:bg-blue-700 text-white"
									onClick={() => setShowCreateModal(true)}
								>
									<Plus className="w-4 h-4 mr-2" />
									Create Your First Agent
								</Button>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Agents Grid */}
						<div className="lg:col-span-2">
							<Card className="border-gray-200">
								<CardHeader>
									<CardTitle className="text-gray-900">Your Agents</CardTitle>
									<CardDescription className="text-gray-600">
										Manage and monitor your AI agents
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{agents.map((agent: any, index: number) => {
											const tasksCompleted = Math.floor(Math.random() * 1000);
											return (
												<motion.div
													key={agent.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.4, delay: index * 0.05 }}
													className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
												>
													<div className="flex items-center justify-between mb-3">
														<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
															<Brain className="w-5 h-5 text-blue-600" />
														</div>
														<div className="flex items-center gap-2">
															<Badge
																className={
																	agent.active
																		? 'bg-emerald-100 text-emerald-700 border-emerald-200'
																		: 'bg-gray-100 text-gray-600 border-gray-200'
																}
															>
																{agent.active ? 'active' : 'idle'}
															</Badge>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleToggleAgent(agent.id, agent.active)
																}
																disabled={
																	activateAgent.isPending ||
																	deactivateAgent.isPending
																}
															>
																{activateAgent.isPending ||
																deactivateAgent.isPending ? (
																	<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
																) : agent.active ? (
																	<Pause className="w-4 h-4 text-gray-600" />
																) : (
																	<Play className="w-4 h-4 text-gray-600" />
																)}
															</Button>
														</div>
													</div>

													<h3 className="text-gray-900 font-semibold mb-1">
														{agent.name}
													</h3>
													<p className="text-gray-600 text-sm mb-3">
														{agent.type
															.replace('_', ' ')
															.replace(/\b\w/g, (l: string) =>
																l.toUpperCase()
															)}
													</p>

													<div className="text-xs text-gray-600 mb-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
														Model:{' '}
														<span className="font-semibold">
															{agent.model || 'gpt-4'}
														</span>
													</div>

													<div className="flex items-center justify-between text-xs pt-3 border-t border-gray-200">
														<span className="text-gray-600">
															Tasks:{' '}
															<span className="text-gray-900 font-semibold">
																{tasksCompleted.toLocaleString()}
															</span>
														</span>
														<Button
															variant="ghost"
															size="sm"
															className="h-7 px-2"
														>
															<Settings className="w-3.5 h-3.5 text-gray-600" />
														</Button>
													</div>
												</motion.div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Activity Feed */}
						<div className="space-y-6">
							<Card className="border-gray-200">
								<CardHeader>
									<CardTitle className="text-gray-900">
										Activity Feed
									</CardTitle>
									<CardDescription className="text-gray-600">
										Real-time agent activities
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{activityFeed.length === 0 ? (
											<div className="text-center py-8">
												<Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
												<p className="text-gray-500 text-sm">
													No recent activity
												</p>
											</div>
										) : (
											activityFeed.slice(0, 5).map((activity: any) => (
												<div
													key={activity.id}
													className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
												>
													<div
														className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
															activity.status === 'completed'
																? 'bg-emerald-500'
																: activity.status === 'failed'
																? 'bg-rose-500'
																: 'bg-blue-500'
														}`}
													>
														<CheckCircle className="w-4 h-4 text-white" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm text-gray-900 font-medium">
															{activity.action}
														</p>
														<div className="flex items-center gap-2 mt-1">
															<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
																{activity.agentName}
															</Badge>
															<span className="text-xs text-gray-500">
																{new Date(
																	activity.timestamp
																).toLocaleTimeString()}
															</span>
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>

							<Card className="border-gray-200">
								<CardHeader>
									<CardTitle className="text-gray-900">
										Quick Actions
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
										<Zap className="w-4 h-4 mr-2" />
										Train Custom Agent
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100"
									>
										<Settings className="w-4 h-4 mr-2" />
										Agent Settings
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100"
									>
										<BarChart3 className="w-4 h-4 mr-2" />
										Performance Report
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</div>

			{/* Create Agent Modal */}
			<AnimatePresence>
				{showCreateModal && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50 z-50"
							onClick={() => {
								setShowCreateModal(false);
								setStep(1);
								setSelectedTemplate(null);
							}}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="fixed inset-0 z-50 flex items-center justify-center p-4"
						>
							<Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-gray-200">
								<CardHeader className="border-b border-gray-200">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-gray-900">
												Create AI Agent
											</CardTitle>
											<CardDescription className="text-gray-600">
												Step {step} of 2
											</CardDescription>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setShowCreateModal(false);
												setStep(1);
												setSelectedTemplate(null);
											}}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									{step === 1 ? (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Choose Agent Type
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{agentTemplates.map((template) => (
													<button
														key={template.type}
														onClick={() => {
															setSelectedTemplate(template.type);
															setStep(2);
														}}
														className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
													>
														<div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
															<template.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
														</div>
														<h4 className="font-semibold text-gray-900 mb-2">
															{template.name}
														</h4>
														<p className="text-sm text-gray-600 mb-4">
															{template.description}
														</p>
														<div className="space-y-1">
															{template.features.map((feature, idx) => (
																<div
																	key={idx}
																	className="flex items-center gap-2 text-xs text-gray-600"
																>
																	<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
																	{feature}
																</div>
															))}
														</div>
													</button>
												))}
											</div>
										</div>
									) : (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Configure Agent
											</h3>
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium text-gray-900 mb-2 block">
														Agent Name
													</label>
													<input
														type="text"
														placeholder="My Content Creator"
														className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													/>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-900 mb-2 block">
														AI Provider
													</label>
													<select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
														<option>OpenAI GPT-4</option>
														<option>Anthropic Claude</option>
														<option>Google Gemini</option>
														<option>DeepSeek</option>
													</select>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-900 mb-2 block">
														Monthly Budget
													</label>
													<input
														type="number"
														placeholder="100"
														className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													/>
												</div>
												<div className="flex gap-3 pt-4">
													<Button
														variant="outline"
														className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
														onClick={() => setStep(1)}
													>
														Back
													</Button>
													<Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
														Create Agent
														<ArrowRight className="w-4 h-4 ml-2" />
													</Button>
												</div>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
