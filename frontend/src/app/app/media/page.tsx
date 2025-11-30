'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Upload,
	Image as ImageIcon,
	Video,
	File,
	Search,
	X,
	Grid3X3,
	List,
	Download,
	Trash2,
	MoreVertical,
	Check,
	FileImage,
	FileVideo,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/loading-state';
import { usePrefersReducedMotion } from '@/lib/accessibility';

type MediaType = 'all' | 'images' | 'videos' | 'documents';
type ViewMode = 'grid' | 'list';

interface MediaItem {
	id: string;
	name: string;
	type: 'image' | 'video' | 'document';
	url: string;
	size: number;
	uploadedAt: Date;
	thumbnail?: string;
}

interface UploadingFile {
	id: string;
	name: string;
	progress: number;
	file: File;
}

export default function MediaPage() {
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [activeFilter, setActiveFilter] = useState<MediaType>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const prefersReducedMotion = usePrefersReducedMotion();

	const filteredMedia = mediaItems.filter(item => {
		const matchesFilter = activeFilter === 'all' || 
			(activeFilter === 'images' && item.type === 'image') ||
			(activeFilter === 'videos' && item.type === 'video') ||
			(activeFilter === 'documents' && item.type === 'document');
		const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	const handleFileSelect = useCallback((files: FileList | null) => {
		if (!files) return;
		const newUploads: UploadingFile[] = Array.from(files).map(file => ({
			id: Math.random().toString(36).slice(2, 11),
			name: file.name,
			progress: 0,
			file,
		}));
		setUploadingFiles(prev => [...prev, ...newUploads]);
		newUploads.forEach(upload => {
			const interval = setInterval(() => {
				setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, progress: Math.min(u.progress + 10, 100) } : u));
			}, 200);
			setTimeout(() => {
				clearInterval(interval);
				setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
				const mediaType = upload.file.type.startsWith('image/') ? 'image' : upload.file.type.startsWith('video/') ? 'video' : 'document';
				setMediaItems(prev => [...prev, {
					id: upload.id,
					name: upload.name,
					type: mediaType,
					url: URL.createObjectURL(upload.file),
					size: upload.file.size,
					uploadedAt: new Date(),
					thumbnail: mediaType === 'image' ? URL.createObjectURL(upload.file) : undefined,
				}]);
			}, 2000);
		});
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }, [handleFileSelect]);
	const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
	const toggleSelection = (id: string) => {
		setSelectedItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(id)) newSet.delete(id);
			else newSet.add(id);
			return newSet;
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	};

	const getMediaIcon = (type: string) => {
		switch (type) {
			case 'image': return <FileImage className="w-5 h-5" />;
			case 'video': return <FileVideo className="w-5 h-5" />;
			default: return <File className="w-5 h-5" />;
		}
	};

	const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
	const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
			{/* Header */}
			<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
						<ImageIcon className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
						<p className="text-sm text-gray-500">Upload and manage your images, videos, and documents</p>
					</div>
				</div>
				<Button onClick={() => fileInputRef.current?.click()} className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm px-6 h-11">
					<Upload className="w-4 h-4 mr-2" />Upload Media
				</Button>
				<input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
			</motion.div>

			{/* Filters and Controls */}
			<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
					{[
						{ id: 'all', label: 'All Media', icon: Grid3X3 },
						{ id: 'images', label: 'Images', icon: ImageIcon },
						{ id: 'videos', label: 'Videos', icon: Video },
						{ id: 'documents', label: 'Documents', icon: File },
					].map(filter => {
						const Icon = filter.icon;
						return (
							<button
								key={filter.id}
								onClick={() => setActiveFilter(filter.id as MediaType)}
								className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
									activeFilter === filter.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
								}`}
							>
								<Icon className="w-4 h-4" />{filter.label}
							</button>
						);
					})}
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search media..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
					</div>
				</div>
			</motion.div>

			{/* Selection Actions */}
			<AnimatePresence>
				{selectedItems.size > 0 && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
								<Check className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="font-medium text-gray-900">{selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected</p>
								<p className="text-sm text-gray-500">Choose an action to perform</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4 mr-2" />Download</Button>
							<Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
							<Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>Cancel</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Uploading Files */}
			<AnimatePresence>
				{uploadingFiles.length > 0 && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
						{uploadingFiles.map(file => (
							<Card key={file.id} className="bg-white border border-gray-200 shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
											<Upload className="w-5 h-5 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-900 truncate mb-1">{file.name}</p>
											<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
												<motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${file.progress}%` }} transition={{ duration: 0.3 }} />
											</div>
										</div>
										<span className="text-sm font-medium text-gray-600">{file.progress}%</span>
									</div>
								</CardContent>
							</Card>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Loading State */}
			{isLoading && (
				<div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-3'}>
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className={viewMode === 'grid' ? 'h-48' : 'h-20'} />)}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && mediaItems.length === 0 && (
				<EmptyState
					icon={<ImageIcon className="w-10 h-10" />}
					title="No Media Yet"
					description="Upload images, videos, and documents to use in your social media posts."
					iconGradient="from-gray-100 to-gray-200"
					action={{ label: 'Upload Media', onClick: () => fileInputRef.current?.click(), icon: <Upload className="w-4 h-4" /> }}
				/>
			)}

			{/* No Results State */}
			{!isLoading && mediaItems.length > 0 && filteredMedia.length === 0 && (
				<EmptyState
					icon={<Search className="w-10 h-10" />}
					title="No Results Found"
					description={`No media matches your ${searchQuery ? 'search query' : 'filter criteria'}.`}
					iconGradient="from-gray-100 to-gray-200"
					action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setActiveFilter('all'); } }}
				/>
			)}

			{/* Media Grid/List */}
			<AnimatePresence mode="wait">
				{!isLoading && filteredMedia.length > 0 && (
					<motion.div key={viewMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onDrop={handleDrop} onDragOver={handleDragOver}>
						{viewMode === 'grid' ? (
							<motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" variants={containerVariants} initial="hidden" animate="visible">
								{filteredMedia.map((item) => (
									<motion.div key={item.id} variants={itemVariants} whileHover={!prefersReducedMotion ? { y: -4 } : {}}>
										<Card className="bg-white border border-gray-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md hover:border-gray-300 transition-all" onClick={() => toggleSelection(item.id)}>
											<div className="relative aspect-square bg-gray-100">
												{item.type === 'image' && item.thumbnail ? (
													<img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">{getMediaIcon(item.type)}</div>
													</div>
												)}
												<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
													<div className="absolute bottom-0 left-0 right-0 p-3 text-white">
														<p className="text-xs font-medium truncate">{item.name}</p>
													</div>
												</div>
												<div className="absolute top-2 left-2">
													<motion.div initial={false} animate={{ scale: selectedItems.has(item.id) ? 1 : 0, opacity: selectedItems.has(item.id) ? 1 : 0 }} className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center shadow-lg">
														<Check className="w-4 h-4 text-white" />
													</motion.div>
												</div>
												<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50" onClick={(e) => e.stopPropagation()}>
														<MoreVertical className="w-4 h-4 text-gray-700" />
													</button>
												</div>
											</div>
											<CardContent className="p-3">
												<p className="text-xs text-gray-600 truncate mb-1">{item.name}</p>
												<div className="flex items-center justify-between text-xs text-gray-400">
													<span>{formatFileSize(item.size)}</span>
													<span>{item.uploadedAt.toLocaleDateString()}</span>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
								{filteredMedia.map((item) => (
									<motion.div key={item.id} variants={itemVariants} whileHover={!prefersReducedMotion ? { x: 4 } : {}}>
										<Card className="bg-white border border-gray-200 shadow-sm group cursor-pointer hover:shadow-md hover:border-gray-300 transition-all" onClick={() => toggleSelection(item.id)}>
											<CardContent className="p-4">
												<div className="flex items-center gap-4">
													<div className="relative">
														<div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
															{item.type === 'image' && item.thumbnail ? (
																<img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
															) : (
																<div className="w-full h-full flex items-center justify-center text-gray-500">{getMediaIcon(item.type)}</div>
															)}
														</div>
														{selectedItems.has(item.id) && (
															<div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
																<Check className="w-3 h-3 text-white" />
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 truncate mb-1">{item.name}</p>
														<div className="flex items-center gap-4 text-sm text-gray-500">
															<span className="flex items-center gap-1">{getMediaIcon(item.type)}{item.type}</span>
															<span>{formatFileSize(item.size)}</span>
															<span>{item.uploadedAt.toLocaleDateString()}</span>
														</div>
													</div>
													<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														<button className="p-2 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}><Download className="w-4 h-4 text-gray-600" /></button>
														<button className="p-2 hover:bg-red-50 rounded-lg" onClick={(e) => e.stopPropagation()}><Trash2 className="w-4 h-4 text-red-500" /></button>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
