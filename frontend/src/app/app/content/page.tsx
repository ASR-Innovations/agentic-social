'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Plus,
	Calendar,
	Grid3X3,
	List,
	Filter,
	Search,
	MoreVertical,
	Edit,
	Trash2,
	Copy,
	Eye,
	Clock,
	CheckCircle2,
	XCircle,
	FileText,
	Sparkles,
	Send,
	Save,
	X,
	Upload,
	Hash,
	AtSign,
	MapPin,
	Smile,
	Link as LinkIcon,
	Target,
	Zap,
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

type ViewMode = 'grid' | 'list' | 'calendar';
type TabType = 'all' | 'drafts' | 'scheduled' | 'published';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface Post {
	id: string;
	title: string;
	content: string;
	status: PostStatus;
	platforms: string[];
	scheduledAt?: Date;
	publishedAt?: Date;
	mediaUrls: string[];
	engagement?: {
		likes: number;
		comments: number;
		shares: number;
	};
}

const mockPosts: Post[] = [
	{
		id: '1',
		title: 'Product Launch Announcement',
		content: 'Excited to announce our new product! 🚀 #ProductLaunch',
		status: 'published',
		platforms: ['Instagram', 'Twitter', 'LinkedIn'],
		publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
		mediaUrls: ['https://via.placeholder.com/400'],
		engagement: { likes: 245, comments: 32, shares: 18 },
	},
	{
		id: '2',
		title: 'Industry Insights Thread',
		content: 'Top 5 trends in social media marketing for 2024...',
		status: 'scheduled',
		platforms: ['Twitter', 'LinkedIn'],
		scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
		mediaUrls: [],
	},
	{
		id: '3',
		title: 'Behind the Scenes',
		content: 'A day in the life at our office 📸',
		status: 'draft',
		platforms: ['Instagram'],
		mediaUrls: ['https://via.placeholder.com/400', 'https://via.placeholder.com/400'],
	},
];

export default function ContentPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [activeTab, setActiveTab] = useState<TabType>('all');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [posts] = useState<Post[]>(mockPosts);
	const [searchQuery, setSearchQuery] = useState('');
	const [postContent, setPostContent] = useState('');
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [scheduleDate, setScheduleDate] = useState('');

	const tabs = [
		{ id: 'all', label: 'All Posts', count: posts.length },
		{ id: 'drafts', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
		{ id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
		{ id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
	];

	const platforms = [
		{ id: 'instagram', name: 'Instagram', color: 'from-purple-500 to-pink-500' },
		{ id: 'twitter', name: 'Twitter', color: 'from-blue-400 to-blue-600' },
		{ id: 'linkedin', name: 'LinkedIn', color: 'from-blue-600 to-blue-800' },
		{ id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-indigo-600' },
		{ id: 'tiktok', name: 'TikTok', color: 'from-black to-gray-800' },
	];

	const filteredPosts = posts.filter(post => {
		const matchesTab = activeTab === 'all' || post.status === activeTab.slice(0, -1);
		const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	const getStatusIcon = (status: PostStatus) => {
		switch (status) {
			case 'published':
				return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
			case 'scheduled':
				return <Clock className="w-4 h-4 text-blue-600" />;
			case 'draft':
				return <FileText className="w-4 h-4 text-gray-600" />;
			case 'failed':
				return <XCircle className="w-4 h-4 text-rose-600" />;
		}
	};

	const getStatusBadge = (status: PostStatus) => {
		const styles = {
			published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
			scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
			draft: 'bg-gray-100 text-gray-700 border-gray-200',
			failed: 'bg-rose-100 text-rose-700 border-rose-200',
		};
		return styles[status];
	};

	const togglePlatform = (platformId: string) => {
		setSelectedPlatforms(prev =>
			prev.includes(platformId)
				? prev.filter(p => p !== platformId)
				: [...prev, platformId]
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto p-6 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-semibold text-gray-900 mb-1">
							Content
						</h1>
						<p className="text-gray-600">
							Create, schedule, and manage your social media posts
						</p>
					</div>
					<Button
						className="bg-blue-600 hover:bg-blue-700 text-white"
						onClick={() => setShowCreateModal(true)}
					>
						<Plus className="w-4 h-4 mr-2" />
						Create Post
					</Button>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as TabType)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
									activeTab === tab.id
										? 'bg-blue-600 text-white shadow-sm'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
								}`}
							>
								{tab.label}
								<span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
									activeTab === tab.id
										? 'bg-white/20 text-white'
										: 'bg-gray-100 text-gray-600'
								}`}>
									{tab.count}
								</span>
							</button>
						))}
					</div>

					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search posts..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
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

						<Button variant="outline" className="border-gray-300">
							<Filter className="w-4 h-4 mr-2" />
							Filter
						</Button>
					</div>
				</div>

				{viewMode === 'grid' && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredPosts.map((post, index) => (
							<motion.div
								key={post.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
							>
								<Card className="border-gray-200 hover:shadow-md transition-shadow group">
									<CardContent className="p-4">
										{post.mediaUrls.length > 0 && (
											<div className="relative mb-3 rounded-lg overflow-hidden bg-gray-100 aspect-video">
												<img
													src={post.mediaUrls[0]}
													alt={post.title}
													className="w-full h-full object-cover"
												/>
												{post.mediaUrls.length > 1 && (
													<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
														+{post.mediaUrls.length - 1}
													</div>
												)}
											</div>
										)}

										<div className="flex items-center justify-between mb-2">
											<Badge className={getStatusBadge(post.status)}>
												{getStatusIcon(post.status)}
												<span className="ml-1">{post.status}</span>
											</Badge>
											<Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</div>

										<h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
											{post.title}
										</h3>
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											{post.content}
										</p>

										<div className="flex items-center gap-2 mb-3">
											{post.platforms.map(platform => (
												<div
													key={platform}
													className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
												>
													{platform}
												</div>
											))}
										</div>

										<div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs text-gray-600">
											{post.status === 'published' && post.engagement && (
												<div className="flex items-center gap-3">
													<span>{post.engagement.likes} likes</span>
													<span>{post.engagement.comments} comments</span>
												</div>
											)}
											{post.status === 'scheduled' && post.scheduledAt && (
												<span>
													<Clock className="w-3 h-3 inline mr-1" />
													{post.scheduledAt.toLocaleString()}
												</span>
											)}
											{post.status === 'draft' && (
												<span className="text-gray-500">Draft</span>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				)}

				{viewMode === 'list' && (
					<Card className="border-gray-200">
						<CardContent className="p-0">
							<div className="divide-y divide-gray-200">
								{filteredPosts.map((post, index) => (
									<motion.div
										key={post.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className="p-4 hover:bg-gray-50 transition-colors group"
									>
										<div className="flex items-center gap-4">
											{post.mediaUrls.length > 0 ? (
												<div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
													<img
														src={post.mediaUrls[0]}
														alt={post.title}
														className="w-full h-full object-cover"
													/>
												</div>
											) : (
												<div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
													<FileText className="w-6 h-6 text-gray-400" />
												</div>
											)}

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-semibold text-gray-900 truncate">
														{post.title}
													</h3>
													<Badge className={getStatusBadge(post.status)}>
														{post.status}
													</Badge>
												</div>
												<p className="text-sm text-gray-600 line-clamp-1 mb-2">
													{post.content}
												</p>
												<div className="flex items-center gap-3 text-xs text-gray-500">
													<span className="flex items-center gap-1">
														{post.platforms.join(', ')}
													</span>
													{post.status === 'published' && post.engagement && (
														<>
															<span>•</span>
															<span>{post.engagement.likes} likes</span>
															<span>{post.engagement.comments} comments</span>
														</>
													)}
													{post.status === 'scheduled' && post.scheduledAt && (
														<>
															<span>•</span>
															<span>
																<Clock className="w-3 h-3 inline mr-1" />
																{post.scheduledAt.toLocaleString()}
															</span>
														</>
													)}
												</div>
											</div>

											<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button variant="ghost" size="sm">
													<Eye className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Edit className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Copy className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700">
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{viewMode === 'calendar' && (
					<Card className="border-gray-200">
						<CardContent className="p-6">
							<div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
								<div className="text-center">
									<Calendar className="w-16 h-16 mx-auto mb-4 text-blue-500" />
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										Calendar View
									</h3>
									<p className="text-gray-600">
										Interactive calendar with scheduled posts
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			<AnimatePresence>
				{showCreateModal && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50 z-50"
							onClick={() => setShowCreateModal(false)}
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
											<CardTitle className="text-gray-900">Create Post</CardTitle>
											<CardDescription className="text-gray-600">
												Compose and schedule your social media content
											</CardDescription>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowCreateModal(false)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="p-6 space-y-6">
									<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
												<Sparkles className="w-5 h-5 text-white" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-900 mb-1">
													AI Content Assistant
												</h4>
												<p className="text-sm text-gray-700 mb-3">
													Get AI-powered suggestions for captions, hashtags, and optimal posting times
												</p>
												<div className="flex gap-2">
													<Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
														<Zap className="w-3.5 h-3.5 mr-1" />
														Generate Caption
													</Button>
													<Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
														<Hash className="w-3.5 h-3.5 mr-1" />
														Suggest Hashtags
													</Button>
													<Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
														<Target className="w-3.5 h-3.5 mr-1" />
														Best Time
													</Button>
												</div>
											</div>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-900 mb-2 block">
											Post Content
										</label>
										<textarea
											value={postContent}
											onChange={(e) => setPostContent(e.target.value)}
											placeholder="What's on your mind?"
											rows={6}
											className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
										/>
										<div className="flex items-center justify-between mt-2">
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">
													<Smile className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<Hash className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<AtSign className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<MapPin className="w-4 h-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<LinkIcon className="w-4 h-4" />
												</Button>
											</div>
											<span className="text-xs text-gray-500">
												{postContent.length} / 2200 characters
											</span>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-900 mb-2 block">
											Media
										</label>
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
											<Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
											<p className="text-sm text-gray-600 mb-1">
												Drag and drop or click to upload
											</p>
											<p className="text-xs text-gray-500">
												Images, videos up to 50MB
											</p>
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-900 mb-3 block">
											Select Platforms
										</label>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
											{platforms.map(platform => (
												<button
													key={platform.id}
													onClick={() => togglePlatform(platform.id)}
													className={`p-4 rounded-lg border-2 transition-all ${
														selectedPlatforms.includes(platform.id)
															? 'border-blue-500 bg-blue-50'
															: 'border-gray-200 hover:border-gray-300'
													}`}
												>
													<div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} mx-auto mb-2`} />
													<p className="text-sm font-medium text-gray-900">
														{platform.name}
													</p>
												</button>
											))}
										</div>
									</div>

									<div>
										<label className="text-sm font-medium text-gray-900 mb-2 block">
											Schedule (Optional)
										</label>
										<input
											type="datetime-local"
											value={scheduleDate}
											onChange={(e) => setScheduleDate(e.target.value)}
											className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div className="flex gap-3 pt-4 border-t border-gray-200">
										<Button
											variant="outline"
											className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
											onClick={() => setShowCreateModal(false)}
										>
											<Save className="w-4 h-4 mr-2" />
											Save Draft
										</Button>
										<Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
											{scheduleDate ? (
												<>
													<Clock className="w-4 h-4 mr-2" />
													Schedule Post
												</>
											) : (
												<>
													<Send className="w-4 h-4 mr-2" />
													Publish Now
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
