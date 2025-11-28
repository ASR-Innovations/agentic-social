'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
	Check,
	Circle,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { XIcon } from '@/components/icons/XIcon';

export default function DashboardPage() {
	const [mounted, setMounted] = useState(false);
	const prefersReducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const stats = [
		{
			label: 'Total Reach',
			value: '124.5K',
			change: '+12.3%',
			trend: 'up' as const,
			icon: Eye,
		},
		{
			label: 'Engagement',
			value: '8.2%',
			change: '+2.4%',
			trend: 'up' as const,
			icon: Heart,
		},
		{
			label: 'Followers',
			value: '2,847',
			change: '+18.2%',
			trend: 'up' as const,
			icon: Users,
		},
		{
			label: 'Posts',
			value: '156',
			change: '-3.1%',
			trend: 'down' as const,
			icon: MessageSquare,
		},
	];

	const recentPosts = [
		{
			platform: 'X',
			platformIcon: XIcon,
			content: 'New product launch announcement',
			time: '2h ago',
			metrics: { likes: 245, comments: 32, shares: 18 },
		},
		{
			platform: 'LinkedIn',
			platformIcon: Linkedin,
			content: 'Company culture spotlight',
			time: '4h ago',
			metrics: { likes: 312, comments: 45, shares: 28 },
		},
		{
			platform: 'Instagram',
			platformIcon: Instagram,
			content: 'Behind the scenes content',
			time: '6h ago',
			metrics: { likes: 189, comments: 24, shares: 12 },
		},
	];

	const schedule = [
		{ time: '2:00 PM', platform: 'X', title: 'Product showcase' },
		{ time: '4:30 PM', platform: 'LinkedIn', title: 'Industry insights' },
		{ time: '6:00 PM', platform: 'Instagram', title: 'Team spotlight' },
	];

	return (
		<div className="min-h-screen bg-[#FAFAFA]">
			<div className="max-w-7xl mx-auto p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 md:space-y-6">
				{/* Minimal Header */}
				<motion.div
					initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
					animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
				>
					<div className="min-w-0">
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Dashboard</h1>
						<p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
							{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
						</p>
					</div>
					<Button className="bg-gray-900 hover:bg-gray-800 text-white min-h-[44px] sm:min-h-[36px] h-auto sm:h-9 px-4 text-sm whitespace-nowrap">
						<Plus className="w-4 h-4 mr-1.5" />
						<span className="hidden xs:inline">New Post</span>
						<span className="xs:hidden">New</span>
					</Button>
				</motion.div>

				{/* Minimalist Stats Grid */}
				<motion.div
					initial={prefersReducedMotion ? {} : { opacity: 0 }}
					animate={prefersReducedMotion ? {} : { opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
				>
					{stats.map((stat, index) => {
						const Icon = stat.icon;
						const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

						return (
							<motion.div
								key={stat.label}
								initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
								animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
								transition={{ delay: 0.1 + index * 0.05 }}
							>
								<Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
									<CardContent className="p-4 sm:p-5">
										<div className="flex items-start justify-between mb-3">
											<div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
												<Icon className="w-4 h-4 text-gray-700" />
											</div>
											<div className={`flex items-center gap-1 text-xs font-medium ${
												stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
											}`}>
												<TrendIcon className="w-3 h-3" />
												{stat.change}
											</div>
										</div>
										<div className="space-y-0.5">
											<p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
											<p className="text-xs text-gray-500">{stat.label}</p>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
					{/* Left Column - Activity */}
					<div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
						{/* Chart Card */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<Card className="border-0 shadow-sm bg-white">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-sm font-semibold text-gray-900">Performance</h3>
											<p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
										</div>
										<Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600">
											<Calendar className="w-4 h-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
										<div className="text-center">
											<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
												<Activity className="w-5 h-5 text-gray-400" />
											</div>
											<p className="text-sm font-medium text-gray-900">Chart visualization</p>
											<p className="text-xs text-gray-500 mt-1">Coming soon</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Recent Activity */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							<Card className="border-0 shadow-sm bg-white">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-semibold text-gray-900">Recent Posts</h3>
										<Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600">
											View all
											<ChevronRight className="w-3.5 h-3.5 ml-1" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-0 space-y-3">
									{recentPosts.map((post, index) => {
										const PlatformIcon = post.platformIcon;

										return (
											<motion.div
												key={index}
												initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
												animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
												transition={{ delay: 0.5 + index * 0.1 }}
												className="group"
											>
												<div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
													<div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
														<PlatformIcon className="w-5 h-5 text-white" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<p className="text-xs font-medium text-gray-900">{post.platform}</p>
															<span className="text-xs text-gray-400">•</span>
															<span className="text-xs text-gray-500">{post.time}</span>
														</div>
														<p className="text-sm text-gray-700 mb-2 line-clamp-1">{post.content}</p>
														<div className="flex items-center gap-4 text-xs text-gray-500">
															<span className="flex items-center gap-1">
																<Heart className="w-3.5 h-3.5" />
																{post.metrics.likes}
															</span>
															<span className="flex items-center gap-1">
																<MessageSquare className="w-3.5 h-3.5" />
																{post.metrics.comments}
															</span>
															<span className="flex items-center gap-1">
																<Share2 className="w-3.5 h-3.5" />
																{post.metrics.shares}
															</span>
														</div>
													</div>
													<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
														<MoreVertical className="w-4 h-4 text-gray-400" />
													</Button>
												</div>
											</motion.div>
										);
									})}
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Right Column - Sidebar */}
					<div className="space-y-4 sm:space-y-5 md:space-y-6">
						{/* AI Insight */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
								<CardContent className="p-5">
									<div className="flex items-start gap-3 mb-4">
										<div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
											<Sparkles className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="text-sm font-semibold">AI Insight</h4>
												<Badge className="bg-white/20 text-white border-0 text-[10px] h-4 px-1.5">New</Badge>
											</div>
											<p className="text-xs text-gray-300 leading-relaxed">
												Peak engagement occurs at <span className="font-semibold text-white">2-4 PM</span>.
												Posting during this window increases engagement by up to <span className="font-semibold text-white">23%</span>.
											</p>
										</div>
									</div>
									<Button className="w-full bg-white hover:bg-gray-100 text-gray-900 h-8 text-xs font-medium">
										Optimize Schedule
										<ArrowUpRight className="w-3 h-3 ml-1" />
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* Today's Schedule */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
						>
							<Card className="border-0 shadow-sm bg-white">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-gray-700" />
											<h3 className="text-sm font-semibold text-gray-900">Today</h3>
										</div>
										<Badge variant="default" className="bg-gray-100 text-gray-700 text-[10px] h-5 px-2">
											{schedule.length} scheduled
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0 space-y-2">
									{schedule.map((item, index) => (
										<motion.div
											key={index}
											initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
											animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
											transition={{ delay: 0.7 + index * 0.1 }}
											className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
										>
											<div className="flex items-center gap-2 flex-1 min-w-0">
												<Circle className="w-2 h-2 text-gray-400 fill-gray-400 flex-shrink-0" />
												<span className="text-xs font-medium text-gray-900 min-w-[50px]">{item.time}</span>
												<span className="text-xs text-gray-500 truncate">{item.title}</span>
											</div>
											<Badge variant="default" className="bg-gray-100 text-gray-700 text-[10px] h-5 px-2 flex-shrink-0">
												{item.platform}
											</Badge>
										</motion.div>
									))}
									<Button variant="ghost" className="w-full h-8 text-xs text-gray-600 mt-2">
										<Calendar className="w-3.5 h-3.5 mr-1.5" />
										View calendar
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* AI Agents Status */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
						>
							<Card className="border-0 shadow-sm bg-white">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Zap className="w-4 h-4 text-gray-700" />
											<h3 className="text-sm font-semibold text-gray-900">AI Agents</h3>
										</div>
										<Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] h-5 px-2">
											2 active
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0 space-y-2">
									{[
										{ name: 'Content Creator', status: 'active', task: 'Generating captions' },
										{ name: 'Strategy Agent', status: 'active', task: 'Analyzing trends' },
										{ name: 'Engagement Bot', status: 'idle', task: 'Ready' },
									].map((agent, index) => (
										<motion.div
											key={index}
											initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
											animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
											transition={{ delay: 0.8 + index * 0.1 }}
											className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div className={`w-2 h-2 rounded-full flex-shrink-0 ${
												agent.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'
											}`} />
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-gray-900">{agent.name}</p>
												<p className="text-[10px] text-gray-500 truncate">{agent.task}</p>
											</div>
											<Badge
												variant={agent.status === 'active' ? 'success' : 'default'}
												className={`text-[10px] h-5 px-2 ${
													agent.status === 'active'
														? 'bg-emerald-50 text-emerald-700 border-0'
														: 'bg-gray-100 text-gray-600 border-0'
												}`}
											>
												{agent.status}
											</Badge>
										</motion.div>
									))}
									<Button variant="ghost" className="w-full h-8 text-xs text-gray-600 mt-2">
										Manage agents
										<ChevronRight className="w-3.5 h-3.5 ml-1" />
									</Button>
								</CardContent>
							</Card>
						</motion.div>

						{/* Quick Actions */}
						<motion.div
							initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
							animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
						>
							<Card className="border-0 shadow-sm bg-white">
								<CardHeader className="pb-3">
									<h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
								</CardHeader>
								<CardContent className="pt-0 space-y-2">
									<Button className="w-full justify-start h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs">
										<Plus className="w-3.5 h-3.5 mr-2" />
										Create post
									</Button>
									<Button variant="outline" className="w-full justify-start h-9 text-xs border-gray-200">
										<Calendar className="w-3.5 h-3.5 mr-2" />
										Schedule content
									</Button>
									<Button variant="outline" className="w-full justify-start h-9 text-xs border-gray-200">
										<Activity className="w-3.5 h-3.5 mr-2" />
										View analytics
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
