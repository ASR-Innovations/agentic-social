'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	Plus,
	Calendar,
	Grid3X3,
	List,
	Search,
	FileText,
	Sparkles,
	Clock,
	Target,
	Zap,
	TrendingUp,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePosts } from '@/hooks/useContent';

type ViewMode = 'grid' | 'list' | 'calendar';
type TabType = 'all' | 'drafts' | 'scheduled' | 'published';

export default function ContentPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [activeTab, setActiveTab] = useState<TabType>('all');
	const [searchQuery, setSearchQuery] = useState('');
	
	const { data: posts = [], isLoading } = usePosts();

	const tabs = [
		{ id: 'all', label: 'All Posts', count: posts.length },
		{ id: 'drafts', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
		{ id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
		{ id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
	];

	const filteredPosts = posts.filter(post => {
		const matchesTab = activeTab === 'all' || post.status === activeTab.slice(0, -1);
		const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
						Content Hub
					</h1>
					<p className="text-gray-600">
						Create, schedule, and manage your social media content
					</p>
				</div>
				<Button
					className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
					disabled
				>
					<Plus className="w-4 h-4 mr-2" />
					Create Post
				</Button>
			</div>

			{/* Tabs and Controls */}
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as TabType)}
							className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
								activeTab === tab.id
									? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
							}`}
						>
							{tab.label}
							<span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
								activeTab === tab.id
									? 'bg-white/20 text-white'
									: 'bg-gray-100 text-gray-600'
							}`}>
								{tab.count}
							</span>
						</button>
					))}
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search content..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
						/>
					</div>

					<div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('grid')}
							className={viewMode === 'grid' ? 'bg-gray-100' : ''}
						>
							<Grid3X3 className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('list')}
							className={viewMode === 'list' ? 'bg-gray-100' : ''}
						>
							<List className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('calendar')}
							className={viewMode === 'calendar' ? 'bg-gray-100' : ''}
						>
							<Calendar className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && posts.length === 0 && (
				<Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
					<CardContent className="py-16">
						<div className="text-center max-w-md mx-auto">
							<div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<FileText className="w-10 h-10 text-indigo-600" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-3">
								No Content Yet
							</h3>
							<p className="text-gray-600 mb-6">
								Start creating engaging content for your social media channels. Use AI to help you craft the perfect posts.
							</p>
							
							{/* Feature Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
								<div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
									<Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
									<h4 className="font-semibold text-gray-900 text-sm mb-1">AI-Powered</h4>
									<p className="text-xs text-gray-600">Generate captions and hashtags</p>
								</div>
								<div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
									<Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
									<h4 className="font-semibold text-gray-900 text-sm mb-1">Smart Scheduling</h4>
									<p className="text-xs text-gray-600">Post at optimal times</p>
								</div>
								<div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
									<TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
									<h4 className="font-semibold text-gray-900 text-sm mb-1">Analytics</h4>
									<p className="text-xs text-gray-600">Track performance</p>
								</div>
							</div>

							<div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
								<div className="flex items-start gap-3">
									<Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
									<div className="text-left">
										<h4 className="font-semibold text-amber-900 text-sm mb-1">Coming Soon</h4>
										<p className="text-xs text-amber-700">
											Content creation and management features are being finalized. Your AI agents will help you create amazing content automatically!
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Content Grid/List View */}
			{!isLoading && filteredPosts.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredPosts.map((post, index) => (
						<motion.div
							key={post.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
						>
							<Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-5">
									<h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
									<p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			)}

			{/* Calendar View */}
			{viewMode === 'calendar' && !isLoading && (
				<Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
					<CardContent className="p-8">
						<div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
							<div className="text-center">
								<Calendar className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Calendar View
								</h3>
								<p className="text-gray-600">
									Interactive calendar with scheduled posts coming soon
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
