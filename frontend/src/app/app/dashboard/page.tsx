'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	TrendingUp,
	Users,
	MessageSquare,
	Eye,
	Heart,
	Share2,
	ArrowUpRight,
	ArrowDownRight,
	Clock,
	Calendar,
	Zap,
	Target,
	Plus,
	MoreHorizontal,
	Activity,
	CheckCircle2,
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

export default function DashboardPage() {
	const [mounted, setMounted] = useState(false);

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
			trend: 'up',
			icon: Eye,
			color: 'blue',
		},
		{
			label: 'Engagement Rate',
			value: '8.2%',
			change: '+2.4%',
			trend: 'up',
			icon: Heart,
			color: 'rose',
		},
		{
			label: 'New Followers',
			value: '2,847',
			change: '+18.2%',
			trend: 'up',
			icon: Users,
			color: 'emerald',
		},
		{
			label: 'Posts Published',
			value: '156',
			change: '-3.1%',
			trend: 'down',
			icon: MessageSquare,
			color: 'violet',
		},
	];

	const recentPosts = [
		{
			platform: 'Instagram',
			content: 'New product launch announcement 🚀',
			time: '2 hours ago',
			engagement: { likes: 245, comments: 32, shares: 18 },
			status: 'published',
		},
		{
			platform: 'Twitter',
			content: 'Industry insights thread',
			time: '4 hours ago',
			engagement: { likes: 189, comments: 24, shares: 12 },
			status: 'published',
		},
		{
			platform: 'LinkedIn',
			content: 'Company culture spotlight',
			time: '6 hours ago',
			engagement: { likes: 312, comments: 45, shares: 28 },
			status: 'published',
		},
	];

	const upcomingPosts = [
		{ time: '2:00 PM', platform: 'Instagram', content: 'Product showcase' },
		{ time: '4:30 PM', platform: 'Twitter', content: 'Industry insights' },
		{ time: '6:00 PM', platform: 'LinkedIn', content: 'Team spotlight' },
	];

	const aiAgents = [
		{ name: 'Content Creator', status: 'active', task: 'Generating captions' },
		{ name: 'Strategy Agent', status: 'active', task: 'Analyzing trends' },
		{ name: 'Engagement Bot', status: 'idle', task: 'Monitoring mentions' },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-semibold text-gray-900 mb-1">
							Dashboard
						</h1>
						<p className="text-gray-600">
							Welcome back! Here's your social media overview
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							className="border-gray-300 text-gray-700 hover:bg-gray-100"
						>
							<Calendar className="w-4 h-4 mr-2" />
							Last 7 days
						</Button>
						<Button className="bg-blue-600 hover:bg-blue-700 text-white">
							<Plus className="w-4 h-4 mr-2" />
							Create Post
						</Button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{stats.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
						>
							<Card className="border-gray-200 hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div
											className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}
										>
											<stat.icon
												className={`w-5 h-5 text-${stat.color}-600`}
											/>
										</div>
										<div className="flex items-center gap-1 text-sm">
											{stat.trend === 'up' ? (
												<ArrowUpRight className="w-4 h-4 text-emerald-600" />
											) : (
												<ArrowDownRight className="w-4 h-4 text-rose-600" />
											)}
											<span
												className={
													stat.trend === 'up'
														? 'text-emerald-600 font-medium'
														: 'text-rose-600 font-medium'
												}
											>
												{stat.change}
											</span>
										</div>
									</div>
									<div>
										<p className="text-2xl font-semibold text-gray-900 mb-1">
											{stat.value}
										</p>
										<p className="text-sm text-gray-600">{stat.label}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - 2/3 width */}
					<div className="lg:col-span-2 space-y-6">
						{/* Performance Chart */}
						<Card className="border-gray-200">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-gray-900">
											Performance Overview
										</CardTitle>
										<CardDescription className="text-gray-600">
											Engagement trends over the last 7 days
										</CardDescription>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-gray-600 hover:text-gray-900"
									>
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
									<div className="text-center">
										<TrendingUp className="w-12 h-12 mx-auto mb-3 text-blue-500" />
										<p className="text-gray-700 font-medium">
											Interactive Chart
										</p>
										<p className="text-sm text-gray-500 mt-1">
											Engagement & reach visualization
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="text-gray-900">Recent Posts</CardTitle>
								<CardDescription className="text-gray-600">
									Your latest published content
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{recentPosts.map((post, index) => (
										<div
											key={index}
											className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
										>
											<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
												<Activity className="w-5 h-5 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-semibold text-gray-900">
														{post.platform}
													</p>
													<span className="text-xs text-gray-500">
														{post.time}
													</span>
												</div>
												<p className="text-sm text-gray-700 mb-3">
													{post.content}
												</p>
												<div className="flex items-center gap-4 text-xs text-gray-600">
													<span className="flex items-center gap-1">
														<Heart className="w-3.5 h-3.5" />
														{post.engagement.likes}
													</span>
													<span className="flex items-center gap-1">
														<MessageSquare className="w-3.5 h-3.5" />
														{post.engagement.comments}
													</span>
													<span className="flex items-center gap-1">
														<Share2 className="w-3.5 h-3.5" />
														{post.engagement.shares}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - 1/3 width */}
					<div className="space-y-6">
						{/* AI Insight */}
						<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
							<CardContent className="p-6">
								<div className="flex items-start gap-3 mb-4">
									<div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
										<Zap className="w-5 h-5 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 mb-1">
											AI Insight
										</h3>
										<p className="text-sm text-gray-700">
											Your engagement peaks between 2-4 PM on weekdays. Schedule
											posts during this time for 23% higher engagement.
										</p>
									</div>
								</div>
								<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
									Optimize Schedule
								</Button>
							</CardContent>
						</Card>

						{/* Today's Schedule */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="text-gray-900 flex items-center gap-2">
									<Clock className="w-5 h-5 text-gray-600" />
									Today's Schedule
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{upcomingPosts.map((post, index) => (
										<div
											key={index}
											className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
										>
											<div className="text-xs font-semibold text-blue-600 bg-white px-2 py-1 rounded border border-blue-200">
												{post.time}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium text-gray-600">
													{post.platform}
												</p>
												<p className="text-sm text-gray-900 truncate">
													{post.content}
												</p>
											</div>
										</div>
									))}
								</div>
								<Button
									variant="outline"
									className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
								>
									View Full Calendar
								</Button>
							</CardContent>
						</Card>

						{/* AI Agents */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="text-gray-900 flex items-center gap-2">
									<Target className="w-5 h-5 text-gray-600" />
									AI Agents
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{aiAgents.map((agent, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
										>
											<div className="flex-1">
												<p className="text-sm font-semibold text-gray-900">
													{agent.name}
												</p>
												<p className="text-xs text-gray-600">{agent.task}</p>
											</div>
											<Badge
												className={
													agent.status === 'active'
														? 'bg-emerald-100 text-emerald-700 border-emerald-200'
														: 'bg-gray-100 text-gray-600 border-gray-200'
												}
											>
												{agent.status}
											</Badge>
										</div>
									))}
								</div>
								<Button
									variant="outline"
									className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
								>
									Manage Agents
								</Button>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="text-gray-900">Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
									<Plus className="w-4 h-4 mr-2" />
									Create Post
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100"
								>
									<Calendar className="w-4 h-4 mr-2" />
									Schedule Content
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100"
								>
									<TrendingUp className="w-4 h-4 mr-2" />
									View Analytics
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
