'use client';

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
	Plus,
	Calendar,
	Grid3X3,
	List,
	Search,
	FileText,
	Sparkles,
	Clock,
	Zap,
	TrendingUp,
	X,
	MoreVertical,
	Edit,
	Trash2,
	Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { usePosts } from '@/hooks/useContent';
import { usePrefersReducedMotion } from '@/lib/accessibility';

type ViewMode = 'grid' | 'list' | 'calendar';
type TabType = 'all' | 'drafts' | 'scheduled' | 'published';

export default function ContentPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [activeTab, setActiveTab] = useState<TabType>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const prefersReducedMotion = usePrefersReducedMotion();
	const { data: posts = [], isLoading } = usePosts();

	const tabs = [
		{ id: 'all', label: 'All Posts', count: posts.length },
		{ id: 'drafts', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
		{ id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
		{ id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
	];

	const filteredPosts = posts.filter(post => {
		const matchesTab = activeTab === 'all' || post.status === activeTab.slice(0, -1);
		const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
	const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
			{/* Header */}
			<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
						<Grid3X3 className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Content Hub</h1>
						<p className="text-sm text-gray-500">Create, schedule, and manage your posts</p>
					</div>
				</div>
				<Button className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm min-h-[44px] px-6" disabled>
					<Plus className="w-4 h-4 mr-2" />Create Post
				</Button>
			</motion.div>

			{/* Tabs and Controls */}
			<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				<div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as TabType)}
							className={`px-4 py-2 rounded-lg text-xs font-medium transition-all relative ${
								activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
							}`}
						>
							<span className="flex items-center">
								{tab.label}
								<span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/50 text-gray-500'}`}>
									{tab.count}
								</span>
							</span>
						</button>
					))}
				</div>

				<div className="flex items-center gap-3">
					<div className="relative flex-1 md:flex-initial">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search content..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 w-full md:w-72 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
						/>
						{searchQuery && (
							<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
					<div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
						<Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
							<Grid3X3 className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
							<List className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setViewMode('calendar')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
							<Calendar className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Loading State */}
			{isLoading && (
				<div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
							<div className="animate-pulse space-y-4">
								<div className="h-5 w-20 bg-gray-100 rounded-full" />
								<div className="h-4 w-3/4 bg-gray-100 rounded" />
								<div className="h-3 w-full bg-gray-100 rounded" />
								<div className="h-3 w-2/3 bg-gray-100 rounded" />
							</div>
						</div>
					))}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && posts.length === 0 && (
				<EmptyState icon={<FileText className="w-10 h-10" />} title="No Content Yet" description="Start creating engaging content for your social media channels." iconGradient="from-gray-100 to-gray-200">
					<div className="mt-8 w-full">
						<motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
							<motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
								<div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
									<Sparkles className="w-6 h-6" />
								</div>
								<h4 className="font-semibold text-gray-900 text-sm mb-1">AI-Powered</h4>
								<p className="text-xs text-gray-500">Generate captions and hashtags</p>
							</motion.div>
							<motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
								<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:bg-gray-200 transition-colors">
									<Clock className="w-6 h-6" />
								</div>
								<h4 className="font-semibold text-gray-900 text-sm mb-1">Smart Scheduling</h4>
								<p className="text-xs text-gray-500">Post at optimal times</p>
							</motion.div>
							<motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
								<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:bg-gray-200 transition-colors">
									<TrendingUp className="w-6 h-6" />
								</div>
								<h4 className="font-semibold text-gray-900 text-sm mb-1">Analytics</h4>
								<p className="text-xs text-gray-500">Track performance</p>
							</motion.div>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
									<Zap className="w-5 h-5 text-white" />
								</div>
								<div className="text-left">
									<h4 className="font-semibold text-amber-800 text-sm mb-1">Coming Soon</h4>
									<p className="text-xs text-amber-700 leading-relaxed">Content creation features are being finalized. Your AI agents will help you create amazing content!</p>
								</div>
							</div>
						</motion.div>
					</div>
				</EmptyState>
			)}

			{/* No Results State */}
			{!isLoading && posts.length > 0 && filteredPosts.length === 0 && (
				<EmptyState icon={<Search className="w-10 h-10" />} title="No Results Found" description={`No posts match your ${searchQuery ? 'search query' : 'filter criteria'}.`} iconGradient="from-gray-100 to-gray-200" action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setActiveTab('all'); } }} />
			)}

			{/* Content Views */}
			<AnimatePresence mode="wait">
				{!isLoading && filteredPosts.length > 0 && (
					<motion.div key={viewMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
						<LayoutGroup>
							{viewMode === 'grid' && (
								<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
									{filteredPosts.map((post) => (
										<motion.div key={post.id} layout variants={itemVariants} whileHover={!prefersReducedMotion ? { y: -4 } : {}} className="group">
											<Card className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md h-full transition-all">
												<CardContent className="p-5">
													<div className="flex items-start justify-between mb-3">
														<span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
															post.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
															post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
														}`}>
															{post.status}
														</span>
														<button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg">
															<MoreVertical className="w-4 h-4 text-gray-500" />
														</button>
													</div>
													<h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
													<p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{post.content}</p>
													<div className="flex items-center justify-between pt-3 border-t border-gray-100">
														<div className="flex items-center gap-2 text-xs text-gray-400">
															<Clock className="w-3 h-3" />
															<span>{new Date(post.createdAt).toLocaleDateString()}</span>
														</div>
														<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-3 h-3 text-gray-500" /></button>
															<button className="p-1.5 hover:bg-gray-100 rounded-lg"><Copy className="w-3 h-3 text-gray-500" /></button>
															<button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3 h-3 text-red-500" /></button>
														</div>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
								</motion.div>
							)}

							{viewMode === 'list' && (
								<motion.div layout className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
									{filteredPosts.map((post) => (
										<motion.div key={post.id} layout variants={itemVariants} whileHover={!prefersReducedMotion ? { x: 4 } : {}} className="group">
											<Card className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
												<CardContent className="p-5">
													<div className="flex items-start gap-4">
														<div className="flex-1">
															<div className="flex items-center gap-3 mb-2">
																<span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
																	post.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
																	post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
																}`}>
																	{post.status}
																</span>
																<div className="flex items-center gap-2 text-xs text-gray-400">
																	<Clock className="w-3 h-3" />
																	<span>{new Date(post.createdAt).toLocaleDateString()}</span>
																</div>
															</div>
															<h4 className="text-sm font-semibold text-gray-900 mb-1.5">{post.title}</h4>
															<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.content}</p>
														</div>
														<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-3.5 h-3.5 text-gray-500" /></button>
															<button className="p-2 hover:bg-gray-100 rounded-lg"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
															<button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
														</div>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
								</motion.div>
							)}
						</LayoutGroup>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Calendar View */}
			{viewMode === 'calendar' && !isLoading && (
				<Card className="bg-white border border-gray-100 shadow-sm">
					<CardContent className="p-8">
						<div className="h-96 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
							<div className="text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
									<Calendar className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
								<p className="text-sm text-gray-500">Interactive calendar with scheduled posts coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
