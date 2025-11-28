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
import {
	Card,
	CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState, SkeletonCard } from '@/components/ui/loading-state';
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
		const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.3, ease: 'easeOut' },
		},
	};

	return (
		<div className="min-h-screen bg-page p-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
						Content Hub
					</h1>
					<p className="text-sm text-gray-500">
						Manage your content
					</p>
				</div>
				<Button
					className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none min-h-[44px] sm:min-h-[36px] whitespace-nowrap"
					disabled
				>
					<Plus className="w-4 h-4 mr-2" />
					Create Post
				</Button>
			</div>

			{/* Tabs and Controls */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
			>
				<div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 overflow-x-auto">
					{tabs.map(tab => (
						<motion.button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as TabType)}
							className={`px-4 py-2 rounded-md text-xs font-medium transition-all relative ${
								activeTab === tab.id
									? 'text-white'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}`}
							whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
							whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
						>
							{activeTab === tab.id && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-gray-900 rounded-md"
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
							<span className="relative z-10 flex items-center">
								{tab.label}
								<span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${
									activeTab === tab.id
										? 'bg-white/20 text-white'
										: 'bg-gray-200 text-gray-600'
								}`}>
									{tab.count}
								</span>
							</span>
						</motion.button>
					))}
				</div>

				<div className="flex items-center gap-3">
					<motion.div
						className="relative flex-1 md:flex-initial"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
						<input
							type="text"
							placeholder="Search content..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2 w-full md:w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all min-h-[44px] md:min-h-[40px]"
						/>
						{searchQuery && (
							<motion.button
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								onClick={() => setSearchQuery('')}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<X className="w-4 h-4" />
							</motion.button>
						)}
					</motion.div>

					<motion.div
						className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('grid')}
							className={`transition-all min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] ${viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
							aria-label="Grid view"
						>
							<Grid3X3 className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('list')}
							className={`transition-all min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] ${viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
							aria-label="List view"
						>
							<List className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('calendar')}
							className={`transition-all min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] ${viewMode === 'calendar' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
							aria-label="Calendar view"
						>
							<Calendar className="w-4 h-4" />
						</Button>
					</motion.div>
				</div>
			</motion.div>

			{/* Loading State */}
			{isLoading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					{viewMode === 'grid' ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<SkeletonCard key={i} />
							))}
						</div>
					) : viewMode === 'list' ? (
						<div className="space-y-4">
							{[1, 2, 3, 4].map((i) => (
								<SkeletonCard key={i} className="h-24" />
							))}
						</div>
					) : (
						<LoadingState size="lg" text="Loading calendar..." />
					)}
				</motion.div>
			)}

			{/* Empty State */}
			{!isLoading && posts.length === 0 && (
				<EmptyState
					icon={<FileText className="w-10 h-10" />}
					title="No Content Yet"
					description="Start creating engaging content for your social media channels. Use AI to help you craft the perfect posts."
					iconGradient="from-gray-100 to-gray-200"
				>
					<div className="mt-8 w-full">
						{/* Feature Cards */}
						<motion.div
							className="grid grid-cols-1 md:grid-cols-3 gap-4"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							<motion.div
								variants={itemVariants}
								className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
							>
								<Sparkles className="w-6 h-6 text-gray-900 mx-auto mb-2" />
								<h4 className="font-medium text-gray-900 text-sm mb-1">AI-Powered</h4>
								<p className="text-xs text-gray-500">Generate captions and hashtags</p>
							</motion.div>
							<motion.div
								variants={itemVariants}
								className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
							>
								<Clock className="w-6 h-6 text-gray-900 mx-auto mb-2" />
								<h4 className="font-medium text-gray-900 text-sm mb-1">Smart Scheduling</h4>
								<p className="text-xs text-gray-500">Post at optimal times</p>
							</motion.div>
							<motion.div
								variants={itemVariants}
								className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
							>
								<TrendingUp className="w-6 h-6 text-gray-900 mx-auto mb-2" />
								<h4 className="font-medium text-gray-900 text-sm mb-1">Analytics</h4>
								<p className="text-xs text-gray-500">Track performance</p>
							</motion.div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
						>
							<div className="flex items-start gap-3">
								<Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
								<div className="text-left">
									<h4 className="font-medium text-amber-900 text-sm mb-1">Coming Soon</h4>
									<p className="text-xs text-amber-700">
										Content creation and management features are being finalized. Your AI agents will help you create amazing content automatically!
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</EmptyState>
			)}

			{/* No Results State */}
			{!isLoading && posts.length > 0 && filteredPosts.length === 0 && (
				<EmptyState
					icon={<Search className="w-10 h-10" />}
					title="No Results Found"
					description={`No posts match your ${searchQuery ? 'search query' : 'filter criteria'}. Try adjusting your filters or search terms.`}
					iconGradient="from-gray-100 to-gray-200"
					action={{
						label: 'Clear Filters',
						onClick: () => {
							setSearchQuery('');
							setActiveTab('all');
						},
					}}
				/>
			)}

			{/* Content Views with Animated Transitions */}
			<AnimatePresence mode="wait">
				{!isLoading && filteredPosts.length > 0 && (
					<motion.div
						key={viewMode}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<LayoutGroup>
							{viewMode === 'grid' && (
								<motion.div
									layout
									className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
									variants={containerVariants}
									initial="hidden"
									animate="visible"
								>
									{filteredPosts.map((post) => (
										<motion.div
											key={post.id}
											layout
											variants={itemVariants}
											whileHover={!prefersReducedMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
										>
											<Card
												variant="default"
												className="bg-white border border-gray-200 shadow-none hover:border-gray-300 h-full group transition-all"
											>
												<CardContent className="p-5">
													<div className="flex items-start justify-between mb-3">
														<div className="flex-1">
															<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 border ${
																post.status === 'published'
																	? 'bg-emerald-50 text-emerald-700 border-emerald-200'
																	: post.status === 'scheduled'
																	? 'bg-blue-50 text-blue-700 border-blue-200'
																	: 'bg-gray-50 text-gray-700 border-gray-200'
															}`}>
																{post.status}
															</span>
														</div>
														<button
															className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-md"
															aria-label="More options"
														>
															<MoreVertical className="w-4 h-4 text-gray-500" />
														</button>
													</div>
													<h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
														{post.title}
													</h4>
													<p className="text-xs text-gray-600 line-clamp-3 mb-4">
														{post.content}
													</p>
													<div className="flex items-center justify-between pt-3 border-t border-gray-100">
														<div className="flex items-center gap-2 text-xs text-gray-500">
															<Clock className="w-3 h-3" />
															<span>{new Date(post.createdAt).toLocaleDateString()}</span>
														</div>
														<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button
																className="p-1 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Edit post"
															>
																<Edit className="w-3 h-3 text-gray-600" />
															</button>
															<button
																className="p-1 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Duplicate post"
															>
																<Copy className="w-3 h-3 text-gray-600" />
															</button>
															<button
																className="p-1 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Delete post"
															>
																<Trash2 className="w-3 h-3 text-gray-600" />
															</button>
														</div>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									))}
								</motion.div>
							)}

							{viewMode === 'list' && (
								<motion.div
									layout
									className="space-y-3"
									variants={containerVariants}
									initial="hidden"
									animate="visible"
								>
									{filteredPosts.map((post) => (
										<motion.div
											key={post.id}
											layout
											variants={itemVariants}
											whileHover={!prefersReducedMotion ? { x: 2, transition: { duration: 0.2 } } : {}}
										>
											<Card
												variant="default"
												className="bg-white border border-gray-200 shadow-none hover:border-gray-300 group transition-all"
											>
												<CardContent className="p-5">
													<div className="flex items-start gap-4">
														<div className="flex-1">
															<div className="flex items-center gap-3 mb-2">
																<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
																	post.status === 'published'
																		? 'bg-emerald-50 text-emerald-700 border-emerald-200'
																		: post.status === 'scheduled'
																		? 'bg-blue-50 text-blue-700 border-blue-200'
																		: 'bg-gray-50 text-gray-700 border-gray-200'
																}`}>
																	{post.status}
																</span>
																<div className="flex items-center gap-2 text-xs text-gray-500">
																	<Clock className="w-3 h-3" />
																	<span>{new Date(post.createdAt).toLocaleDateString()}</span>
																</div>
															</div>
															<h4 className="text-sm font-medium text-gray-900 mb-1.5">
																{post.title}
															</h4>
															<p className="text-xs text-gray-600 line-clamp-2">
																{post.content}
															</p>
														</div>
														<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
															<button
																className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Edit post"
															>
																<Edit className="w-3.5 h-3.5 text-gray-600" />
															</button>
															<button
																className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Duplicate post"
															>
																<Copy className="w-3.5 h-3.5 text-gray-600" />
															</button>
															<button
																className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
																aria-label="Delete post"
															>
																<Trash2 className="w-3.5 h-3.5 text-gray-600" />
															</button>
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
				<Card className="bg-white border border-gray-200 shadow-none">
					<CardContent className="p-8">
						<div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
							<div className="text-center">
								<Calendar className="w-16 h-16 mx-auto mb-4 text-gray-900" />
								<h3 className="text-base font-medium text-gray-900 mb-2">
									Calendar View
								</h3>
								<p className="text-sm text-gray-600">
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
