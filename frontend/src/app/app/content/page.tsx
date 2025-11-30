'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Plus,
	Calendar,
	Grid3X3,
	List,
	Search,
	FileText,
	Sparkles,
	Clock,
	X,
	Trash2,
	Send,
	Twitter,
	Linkedin,
	Instagram,
	Loader2,
	CheckCircle,
	Bot,
	RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-state';
import { usePosts, useCreatePost, usePublishPost, useDeletePost } from '@/hooks/useContent';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Agent } from '@/types/api';

type ViewMode = 'grid' | 'list' | 'calendar';
type TabType = 'all' | 'drafts' | 'scheduled' | 'published';

const platformIcons: Record<string, any> = {
	twitter: Twitter,
	linkedin: Linkedin,
	instagram: Instagram,
};

export default function ContentPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [activeTab, setActiveTab] = useState<TabType>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<any>(null);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [topic, setTopic] = useState('');
	const [generatedContent, setGeneratedContent] = useState<any>(null);
	const [selectedVariation, setSelectedVariation] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	
	const { data: posts = [], isLoading, refetch } = usePosts();
	const createPost = useCreatePost();
	const publishPost = usePublishPost();
	const deletePost = useDeletePost();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [accountsData, agentsData] = await Promise.all([
				apiClient.client.get('/social-accounts'),
				apiClient.getAgents(),
			]);
			setSocialAccounts(accountsData.data || []);
			setAgents(agentsData || []);
		} catch (error) {
			console.error('Failed to load data:', error);
		}
	};

	const tabs = [
		{ id: 'all', label: 'All Posts', count: posts.length },
		{ id: 'drafts', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
		{ id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
		{ id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
	];

	const filteredPosts = posts.filter(post => {
		const matchesTab = activeTab === 'all' || post.status === activeTab.slice(0, -1);
		const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.content?.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	const handleOpenCreateModal = () => {
		setShowCreateModal(true);
		setSelectedAccount(null);
		setSelectedAgent(null);
		setTopic('');
		setGeneratedContent(null);
		setSelectedVariation(0);
	};

	const handleGenerateContent = async () => {
		if (!selectedAgent || !topic.trim()) {
			toast.error('Please select an agent and enter a topic');
			return;
		}
		
		setIsGenerating(true);
		setGeneratedContent(null);
		
		try {
			const taskType = selectedAccount?.platform === 'linkedin' 
				? 'generate_linkedin_content' 
				: selectedAccount?.platform === 'instagram'
				? 'generate_instagram_content'
				: 'generate_twitter_content';
			
			const result = await apiClient.executeAgent(selectedAgent.id, taskType, {
				topic: topic.trim(),
				tone: selectedAgent.personalityConfig?.tone || 'engaging',
				variations: 3,
			});
			
			console.log('Generation result:', result);
			
			if (result && result.output) {
				setGeneratedContent(result.output);
				setSelectedVariation(0);
				toast.success('Content generated successfully!');
			} else if (result && result.success === false) {
				toast.error(result.error || 'Failed to generate content');
			} else {
				toast.error('No content was generated. Please try again.');
			}
		} catch (error: any) {
			console.error('Generation error:', error);
			toast.error(error.message || 'Failed to generate content');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCreateAndPublish = async () => {
		if (!selectedAccount || !generatedContent) {
			toast.error('Please generate content first');
			return;
		}
		
		setIsPublishing(true);
		
		try {
			const content = generatedContent.variations?.[selectedVariation] || generatedContent.content;
			const post = await createPost.mutateAsync({
				title: topic,
				content: content,
				socialAccountIds: [selectedAccount.id],
				type: 'text',
			});
			
			if (post?.id) {
				await publishPost.mutateAsync(post.id);
				toast.success('Post published to ' + selectedAccount.platform + '!');
				setShowCreateModal(false);
				refetch();
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to publish post');
		} finally {
			setIsPublishing(false);
		}
	};

	const handleSaveAsDraft = async () => {
		if (!selectedAccount || !generatedContent) {
			toast.error('Please generate content first');
			return;
		}
		
		setIsSavingDraft(true);
		
		try {
			const content = generatedContent.variations?.[selectedVariation] || generatedContent.content;
			await createPost.mutateAsync({
				title: topic,
				content: content,
				socialAccountIds: [selectedAccount.id],
				type: 'text',
			});
			toast.success('Post saved as draft!');
			setShowCreateModal(false);
			refetch();
		} catch (error: any) {
			toast.error(error.message || 'Failed to save draft');
		} finally {
			setIsSavingDraft(false);
		}
	};

	const handleDeletePost = async (postId: string) => {
		if (!confirm('Delete this post?')) return;
		try {
			await deletePost.mutateAsync(postId);
		} catch (error) {
			console.error('Delete error:', error);
		}
	};

	const handlePublishPost = async (postId: string) => {
		try {
			await publishPost.mutateAsync(postId);
		} catch (error) {
			console.error('Publish error:', error);
		}
	};

	const accountAgents = selectedAccount 
		? agents.filter(a => a.socialAccountId === selectedAccount.id && a.active)
		: [];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
	};

	return (
		<>
		<div className="min-h-screen bg-page p-8 space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">Content Hub</h1>
					<p className="text-sm text-gray-500">Create and manage your content</p>
				</div>
				<Button onClick={handleOpenCreateModal} className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none min-h-[44px] sm:min-h-[36px] whitespace-nowrap">
					<Plus className="w-4 h-4 mr-2" />
					Create Post
				</Button>
			</div>

			<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				<div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 overflow-x-auto">
					{tabs.map(tab => (
						<motion.button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`px-4 py-2 rounded-md text-xs font-medium transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
							{activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gray-900 rounded-md" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
							<span className="relative z-10 flex items-center">{tab.label}<span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{tab.count}</span></span>
						</motion.button>
					))}
				</div>
				<div className="flex items-center gap-3">
					<div className="relative flex-1 md:flex-initial">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
						<input type="text" placeholder="Search content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2 w-full md:w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all min-h-[44px] md:min-h-[40px]" />
						{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
					</div>
					<div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
						<Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`min-w-[36px] min-h-[36px] ${viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}><Grid3X3 className="w-4 h-4" /></Button>
						<Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`min-w-[36px] min-h-[36px] ${viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}><List className="w-4 h-4" /></Button>
						<Button variant="ghost" size="sm" onClick={() => setViewMode('calendar')} className={`min-w-[36px] min-h-[36px] ${viewMode === 'calendar' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}><Calendar className="w-4 h-4" /></Button>
					</div>
				</div>
			</motion.div>

			{isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>}

			{!isLoading && posts.length === 0 && (
				<EmptyState icon={<FileText className="w-10 h-10" />} title="No Content Yet" description="Start creating engaging content for your social media channels." iconGradient="from-gray-100 to-gray-200">
					<Button onClick={handleOpenCreateModal} className="mt-6 bg-gray-900 hover:bg-gray-800 text-white"><Plus className="w-4 h-4 mr-2" />Create Your First Post</Button>
				</EmptyState>
			)}

			{!isLoading && filteredPosts.length > 0 && viewMode === 'grid' && (
				<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
					{filteredPosts.map((post) => (
						<motion.div key={post.id} variants={itemVariants}>
							<Card className="bg-white border border-gray-200 shadow-none hover:border-gray-300 h-full group transition-all">
								<CardContent className="p-5">
									<div className="flex items-start justify-between mb-3">
										<Badge className={post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : post.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>{post.status}</Badge>
									</div>
									<h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{post.title || 'Untitled Post'}</h4>
									<p className="text-xs text-gray-600 line-clamp-3 mb-4">{post.content}</p>
									<div className="flex items-center justify-between pt-3 border-t border-gray-100">
										<div className="flex items-center gap-2 text-xs text-gray-500"><Clock className="w-3 h-3" /><span>{new Date(post.createdAt).toLocaleDateString()}</span></div>
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											{post.status === 'draft' && <button onClick={() => handlePublishPost(post.id)} className="p-1 hover:bg-emerald-100 rounded-md"><Send className="w-3 h-3 text-emerald-600" /></button>}
											<button onClick={() => handleDeletePost(post.id)} className="p-1 hover:bg-gray-100 rounded-md"><Trash2 className="w-3 h-3 text-gray-600" /></button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			)}

			{viewMode === 'calendar' && !isLoading && (
				<Card className="bg-white border border-gray-200 shadow-none">
					<CardContent className="p-8">
						<div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
							<div className="text-center">
								<Calendar className="w-16 h-16 mx-auto mb-4 text-gray-900" />
								<h3 className="text-base font-medium text-gray-900 mb-2">Calendar View</h3>
								<p className="text-sm text-gray-600">Coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>

		{/* Create Post Modal */}
		<AnimatePresence>
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
					<motion.div 
						initial={{ opacity: 0, scale: 0.95, y: 20 }} 
						animate={{ opacity: 1, scale: 1, y: 0 }} 
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.2 }}
						className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
					>
						{/* Header */}
						<div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
										<Sparkles className="w-5 h-5 text-white" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Create Post with AI</h2>
										<p className="text-xs text-gray-500">Generate engaging content in seconds</p>
									</div>
								</div>
								<button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
									<X className="w-5 h-5 text-gray-500" />
								</button>
							</div>
						</div>

						{/* Content */}
						<div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
							{/* Step 1: Select Account */}
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
									<label className="text-sm font-medium text-gray-900">Select Social Account</label>
								</div>
								{socialAccounts.length === 0 ? (
									<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
										No social accounts connected. <a href="/app/settings" className="underline font-medium">Connect one first</a>.
									</div>
								) : (
									<div className="grid grid-cols-2 gap-3">
										{socialAccounts.map(account => {
											const PlatformIcon = platformIcons[account.platform] || Bot;
											const isSelected = selectedAccount?.id === account.id;
											return (
												<button 
													key={account.id} 
													onClick={() => { setSelectedAccount(account); setSelectedAgent(null); setGeneratedContent(null); }} 
													className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
												>
													<div className="flex items-center gap-3">
														<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-gray-900' : 'bg-gray-100'}`}>
															<PlatformIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
														</div>
														<div className="flex-1 min-w-0">
															<p className="font-medium text-gray-900 text-sm truncate">{account.displayName || account.platform}</p>
															<p className="text-xs text-gray-500 capitalize">{account.platform}</p>
														</div>
														{isSelected && <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" />}
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>

							{/* Step 2: Select Agent */}
							{selectedAccount && (
								<motion.div 
									initial={{ opacity: 0, y: 10 }} 
									animate={{ opacity: 1, y: 0 }}
									className="space-y-3"
								>
									<div className="flex items-center gap-2">
										<span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
										<label className="text-sm font-medium text-gray-900">Select AI Agent</label>
									</div>
									{accountAgents.length === 0 ? (
										<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
											No active agents for this account. <a href="/app/ai-hub" className="underline font-medium">Create one first</a>.
										</div>
									) : (
										<div className="grid grid-cols-2 gap-3">
											{accountAgents.map(agent => {
												const isSelected = selectedAgent?.id === agent.id;
												return (
													<button 
														key={agent.id} 
														onClick={() => { setSelectedAgent(agent); setGeneratedContent(null); }} 
														className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
													>
														<div className="flex items-center gap-3">
															<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-gray-900' : 'bg-gray-100'}`}>
																<Sparkles className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
															</div>
															<div className="flex-1 min-w-0">
																<p className="font-medium text-gray-900 text-sm truncate">{agent.name}</p>
																<p className="text-xs text-gray-500">{agent.type.replace('_', ' ')}</p>
															</div>
															{isSelected && <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" />}
														</div>
													</button>
												);
											})}
										</div>
									)}
								</motion.div>
							)}

							{/* Step 3: Enter Topic & Generate */}
							{selectedAgent && (
								<motion.div 
									initial={{ opacity: 0, y: 10 }} 
									animate={{ opacity: 1, y: 0 }}
									className="space-y-3"
								>
									<div className="flex items-center gap-2">
										<span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
										<label className="text-sm font-medium text-gray-900">What do you want to post about?</label>
									</div>
									<div className="space-y-3">
										<textarea 
											value={topic} 
											onChange={(e) => setTopic(e.target.value)} 
											placeholder="e.g., AI in social media marketing, tips for productivity, our new product launch..."
											rows={3}
											className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-0 focus:border-gray-900 text-gray-900 placeholder:text-gray-400 transition-all resize-none"
										/>
										<Button 
											onClick={handleGenerateContent} 
											disabled={isGenerating || !topic.trim()} 
											className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-sm font-medium"
										>
											{isGenerating ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Generating content...
												</>
											) : (
												<>
													<Sparkles className="w-4 h-4 mr-2" />
													Generate Content
												</>
											)}
										</Button>
									</div>
								</motion.div>
							)}

							{/* Step 4: Review Generated Content */}
							{generatedContent && generatedContent.variations && generatedContent.variations.length > 0 && (
								<motion.div 
									initial={{ opacity: 0, y: 10 }} 
									animate={{ opacity: 1, y: 0 }}
									className="space-y-3"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
											<label className="text-sm font-medium text-gray-900">Select a variation</label>
										</div>
										<button 
											onClick={handleGenerateContent}
											disabled={isGenerating}
											className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
										>
											<RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
											Regenerate
										</button>
									</div>
									<div className="space-y-3">
										{generatedContent.variations.map((variation: string, index: number) => {
											const isSelected = selectedVariation === index;
											return (
												<button 
													key={index} 
													onClick={() => setSelectedVariation(index)} 
													className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
												>
													<div className="flex items-start gap-3">
														<div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
															{index + 1}
														</div>
														<p className="text-sm text-gray-700 flex-1 leading-relaxed">{variation}</p>
														{isSelected && <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />}
													</div>
												</button>
											);
										})}
									</div>
									
									{/* Hashtags */}
									{generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
										<div className="pt-3">
											<p className="text-xs text-gray-500 mb-2">Suggested hashtags:</p>
											<div className="flex flex-wrap gap-2">
												{generatedContent.hashtags.map((tag: string, i: number) => (
													<span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
														{tag}
													</span>
												))}
											</div>
										</div>
									)}
								</motion.div>
							)}
						</div>

						{/* Footer Actions */}
						{generatedContent && generatedContent.variations && generatedContent.variations.length > 0 && (
							<div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
								<Button 
									variant="outline" 
									onClick={handleSaveAsDraft} 
									disabled={isSavingDraft}
									className="min-w-[120px]"
								>
									{isSavingDraft ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										'Save as Draft'
									)}
								</Button>
								<Button 
									onClick={handleCreateAndPublish} 
									disabled={isPublishing} 
									className="bg-gray-900 hover:bg-gray-800 text-white min-w-[140px]"
								>
									{isPublishing ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Publishing...
										</>
									) : (
										<>
											<Send className="w-4 h-4 mr-2" />
											Publish Now
										</>
									)}
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
