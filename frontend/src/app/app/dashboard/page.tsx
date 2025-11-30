'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	TrendingUp,
	TrendingDown,
	Users,
	MessageSquare,
	Eye,
	Heart,
	Share2,
	Clock,
	Calendar,
	Zap,
	Plus,
	MoreVertical,
	Activity,
	Sparkles,
	ArrowUpRight,
	ChevronRight,
	Instagram,
	Linkedin,
	Target,
	BarChart3,
	Globe,
	Bot,
	Image as ImageIcon,
	FileText,
	Hash,
	RefreshCw,
	CheckCircle,
	AlertCircle,
	Play,
	Pause,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { XIcon } from '@/components/icons/XIcon';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
	const [mounted, setMounted] = useState(false);
	const [greeting, setGreeting] = useState('');
	const [loading, setLoading] = useState(true);
	const prefersReducedMotion = usePrefersReducedMotion();
	const { user, tenant } = useAuthStore();

	// Data states
	const [analytics, setAnalytics] = useState<any>(null);
	const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
	const [agents, setAgents] = useState<any[]>([]);
	const [recentPosts, setRecentPosts] = useState<any[]>([]);
	const [aiUsage, setAiUsage] = useState<any>(null);

	useEffect(() => {
		setMounted(true);
		const hour = new Date().getHours();
		if (hour < 12) setGreeting('Good morning');
		else if (hour < 18) setGreeting('Good afternoon');
		else setGreeting('Good evening');
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			const [accountsRes, agentsRes, postsRes] = await Promise.all([
				apiClient.client.get('/social-accounts').catch(() => ({ data: [] })),
				apiClient.client.get('/agents').catch(() => ({ data: [] })),
				apiClient.client.get('/posts', { params: { limit: 5 } }).catch(() => ({ data: [] })),
			]);
			setSocialAccounts(accountsRes.data || []);
			setAgents(agentsRes.data || []);
			setRecentPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data?.posts || []);
			
			// Try to load analytics and AI usage
			try {
				const analyticsRes = await apiClient.client.get('/analytics/tenant');
				setAnalytics(analyticsRes.data);
			} catch (e) { /* Analytics might not be available */ }
			
			try {
				const aiRes = await apiClient.client.get('/ai/usage');
				setAiUsage(aiRes.data);
			} catch (e) { /* AI usage might not be available */ }
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!mounted) return null;

	const activeAgents = agents.filter(a => a.active).length;
	const connectedPlatforms = socialAccounts.length;
	const scheduledPosts = recentPosts.filter(p => p.status === 'scheduled').length;
	const publishedPosts = recentPosts.filter(p => p.status === 'published').length;

	const stats = [
		{ label: 'Total Reach', value: analytics?.totalImpressions?.toLocaleString() || '0', change: '+12.3%', trend: 'up' as const, icon: Eye, description: 'Impressions across platforms' },
		{ label: 'Engagement Rate', value: analytics?.averageEngagementRate ? `${analytics.averageEngagementRate.toFixed(1)}%` : '0%', change: '+2.4%', trend: 'up' as const, icon: Heart, description: 'Avg engagement' },
		{ label: 'Connected Platforms', value: connectedPlatforms.toString(), change: connectedPlatforms > 0 ? 'Active' : 'None', trend: 'up' as const, icon: Globe, description: 'Social accounts' },
		{ label: 'Active Agents', value: activeAgents.toString(), change: `${agents.length} total`, trend: 'up' as const, icon: Bot, description: 'AI agents running' },
	];

	const quickActions = [
		{ icon: Plus, label: 'Create Post', href: '/app/content', primary: true },
		{ icon: Calendar, label: 'Schedule', href: '/app/content', primary: false },
		{ icon: BarChart3, label: 'Analytics', href: '/app/analytics', primary: false },
		{ icon: Sparkles, label: 'AI Generate', href: '/app/ai-hub', primary: false },
	];

	const platformIcons: Record<string, any> = { twitter: XIcon, instagram: Instagram, linkedin: Linkedin };

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="max-w-7xl mx-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8">
				{/* Welcome Header */}
				<motion.div initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }} animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 md:p-8">
					<div className="absolute inset-0 opacity-30">
						<div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
					</div>
					<div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-gray-400 text-sm">{greeting}</span>
								<span>👋</span>
							</div>
							<h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {user?.firstName || 'User'}</h1>
							<p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
								<Globe className="w-4 h-4" />
								{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{quickActions.map((action, index) => (
								<motion.a
									key={action.label}
									href={action.href}
									whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
									whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
									className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
										action.primary ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
									}`}
								>
									<action.icon className="w-4 h-4" />
									<span className="hidden sm:inline">{action.label}</span>
								</motion.a>
							))}
						</div>
					</div>
				</motion.div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{stats.map((stat, index) => {
						const Icon = stat.icon;
						const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
						return (
							<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} whileHover={{ y: -4 }} className="group">
								<Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all h-full">
									<CardContent className="p-4 sm:p-5">
										<div className="flex items-start justify-between mb-3">
											<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
												<Icon className="w-5 h-5" />
											</div>
											<span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
										</div>
										<p className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
										<p className="text-xs text-gray-500 mt-1">{stat.label}</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
					{/* Left Column - 2/3 width */}
					<div className="lg:col-span-2 space-y-4 sm:space-y-6">
						{/* Connected Platforms */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
							<Card className="bg-white border border-gray-100 shadow-sm">
								<CardHeader className="pb-3 border-b border-gray-100">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
												<Globe className="w-5 h-5" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-gray-900">Connected Platforms</h3>
												<p className="text-xs text-gray-500">{connectedPlatforms} accounts connected</p>
											</div>
										</div>
										<Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-900" onClick={() => window.location.href = '/app/settings'}>
											Manage<ChevronRight className="w-3.5 h-3.5 ml-1" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-4">
									{loading ? (
										<div className="flex items-center justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
									) : socialAccounts.length === 0 ? (
										<div className="text-center py-8">
											<div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center"><Globe className="w-6 h-6 text-gray-400" /></div>
											<p className="text-sm text-gray-500 mb-3">No platforms connected yet</p>
											<Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => window.location.href = '/app/settings'}>Connect Platform</Button>
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{socialAccounts.map((account, index) => {
												const PlatformIcon = platformIcons[account.platform] || Globe;
												return (
													<motion.div key={account.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
														<div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
															<PlatformIcon className="w-5 h-5 text-gray-700" />
														</div>
														<div className="flex-1 min-w-0">
															<p className="text-sm font-medium text-gray-900 truncate">{account.displayName || account.username}</p>
															<p className="text-xs text-gray-500 capitalize">{account.platform}</p>
														</div>
														<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">
															<CheckCircle className="w-3 h-3 mr-1" />Active
														</Badge>
													</motion.div>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>

						{/* Recent Posts */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
							<Card className="bg-white border border-gray-100 shadow-sm">
								<CardHeader className="pb-3 border-b border-gray-100">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
												<FileText className="w-5 h-5" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-gray-900">Recent Posts</h3>
												<p className="text-xs text-gray-500">{publishedPosts} published, {scheduledPosts} scheduled</p>
											</div>
										</div>
										<Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-900" onClick={() => window.location.href = '/app/content'}>
											View All<ChevronRight className="w-3.5 h-3.5 ml-1" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-4">
									{loading ? (
										<div className="flex items-center justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
									) : recentPosts.length === 0 ? (
										<div className="text-center py-8">
											<div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center"><FileText className="w-6 h-6 text-gray-400" /></div>
											<p className="text-sm text-gray-500 mb-3">No posts yet</p>
											<Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => window.location.href = '/app/content'}>Create Post</Button>
										</div>
									) : (
										<div className="space-y-2">
											{recentPosts.slice(0, 4).map((post, index) => (
												<motion.div key={post.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100">
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<Badge className={`text-[10px] ${post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
																{post.status}
															</Badge>
															<span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
														</div>
														<p className="text-sm text-gray-900 line-clamp-1">{post.title || post.content?.substring(0, 50) || 'Untitled'}</p>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Right Column - 1/3 width */}
					<div className="space-y-4 sm:space-y-6">
						{/* AI Insight Card */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
							<Card className="bg-gray-900 text-white border-0 shadow-lg">
								<CardContent className="p-5">
									<div className="flex items-start gap-3 mb-4">
										<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
											<Sparkles className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="text-sm font-bold">AI Insight</h4>
												<Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] h-5 px-2 font-bold">New</Badge>
											</div>
											<p className="text-xs text-gray-300 leading-relaxed">
												{aiUsage ? (
													<>You've used <span className="font-bold text-emerald-400">${aiUsage.totalCost?.toFixed(2) || '0.00'}</span> of AI credits this month with <span className="font-bold text-emerald-400">{aiUsage.totalRequests || 0}</span> requests.</>
												) : (
													<>Your AI agents are ready to help. Start creating content with AI-powered assistance.</>
												)}
											</p>
										</div>
									</div>
									<Button className="w-full bg-white/10 hover:bg-white/20 text-white h-10 text-xs font-bold border border-white/20 hover:border-white/30 rounded-xl" onClick={() => window.location.href = '/app/ai-hub'}>
										<Bot className="w-4 h-4 mr-2" />Manage AI Agents<ArrowUpRight className="w-3.5 h-3.5 ml-2" />
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* AI Agents Status */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
							<Card className="bg-white border border-gray-100 shadow-sm">
								<CardHeader className="pb-3 border-b border-gray-100">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
												<Zap className="w-5 h-5" />
											</div>
											<h3 className="text-sm font-semibold text-gray-900">AI Agents</h3>
										</div>
										<Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] h-6 px-2.5 font-bold">{activeAgents} active</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-4">
									{loading ? (
										<div className="flex items-center justify-center py-6"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>
									) : agents.length === 0 ? (
										<div className="text-center py-6">
											<div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gray-100 flex items-center justify-center"><Bot className="w-5 h-5 text-gray-400" /></div>
											<p className="text-xs text-gray-500 mb-2">No agents created</p>
											<Button size="sm" variant="outline" className="text-xs" onClick={() => window.location.href = '/app/ai-hub'}>Create Agent</Button>
										</div>
									) : (
										<div className="space-y-2">
											{agents.slice(0, 3).map((agent, index) => (
												<motion.div key={agent.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100">
													<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${agent.active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
														<Sparkles className="w-4 h-4" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-xs font-semibold text-gray-900 truncate">{agent.name}</p>
														<p className="text-[10px] text-gray-500 capitalize">{agent.type?.replace('_', ' ')}</p>
													</div>
													<div className={`w-2.5 h-2.5 rounded-full ${agent.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
												</motion.div>
											))}
											{agents.length > 3 && (
												<Button variant="ghost" className="w-full h-9 text-xs text-gray-500 hover:text-gray-900" onClick={() => window.location.href = '/app/ai-hub'}>
													View all {agents.length} agents<ChevronRight className="w-3.5 h-3.5 ml-1" />
												</Button>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>

						{/* Quick Stats */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
							<Card className="bg-white border border-gray-100 shadow-sm">
								<CardHeader className="pb-3 border-b border-gray-100">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
											<Activity className="w-5 h-5" />
										</div>
										<h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
									</div>
								</CardHeader>
								<CardContent className="pt-4 space-y-3">
									<div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
										<div className="flex items-center gap-2">
											<FileText className="w-4 h-4 text-gray-500" />
											<span className="text-xs text-gray-600">Total Posts</span>
										</div>
										<span className="text-sm font-bold text-gray-900">{analytics?.totalPosts || recentPosts.length}</span>
									</div>
									<div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
										<div className="flex items-center gap-2">
											<Heart className="w-4 h-4 text-gray-500" />
											<span className="text-xs text-gray-600">Total Engagement</span>
										</div>
										<span className="text-sm font-bold text-gray-900">{analytics?.totalEngagement?.toLocaleString() || '0'}</span>
									</div>
									<div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
										<div className="flex items-center gap-2">
											<Sparkles className="w-4 h-4 text-gray-500" />
											<span className="text-xs text-gray-600">AI Requests</span>
										</div>
										<span className="text-sm font-bold text-gray-900">{aiUsage?.totalRequests || 0}</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>

				{/* Platform Performance */}
				{analytics?.byPlatform && Object.keys(analytics.byPlatform).length > 0 && (
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
						<Card className="bg-white border border-gray-100 shadow-sm">
							<CardHeader className="pb-3 border-b border-gray-100">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
										<BarChart3 className="w-5 h-5" />
									</div>
									<div>
										<h3 className="text-base font-semibold text-gray-900">Platform Performance</h3>
										<p className="text-xs text-gray-500">Engagement breakdown by platform</p>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-5">
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
									{Object.entries(analytics.byPlatform).map(([platform, data]: [string, any], index) => {
										const PlatformIcon = platformIcons[platform] || Globe;
										return (
											<motion.div key={platform} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
												<div className="flex items-center gap-3 mb-3">
													<div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
														<PlatformIcon className="w-4 h-4 text-gray-700" />
													</div>
													<span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
												</div>
												<div className="space-y-2">
													<div className="flex justify-between text-xs">
														<span className="text-gray-500">Impressions</span>
														<span className="font-medium text-gray-900">{data.impressions?.toLocaleString() || 0}</span>
													</div>
													<div className="flex justify-between text-xs">
														<span className="text-gray-500">Engagement</span>
														<span className="font-medium text-gray-900">{data.engagement?.toLocaleString() || 0}</span>
													</div>
													<div className="flex justify-between text-xs">
														<span className="text-gray-500">Posts</span>
														<span className="font-medium text-gray-900">{data.postCount || 0}</span>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</div>
	);
}
