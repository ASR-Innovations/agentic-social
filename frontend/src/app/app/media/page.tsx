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

	// Filter media items
	const filteredMedia = mediaItems.filter(item => {
		const matchesFilter = activeFilter === 'all' || 
			(activeFilter === 'images' && item.type === 'image') ||
			(activeFilter === 'videos' && item.type === 'video') ||
			(activeFilter === 'documents' && item.type === 'document');
		const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	// Handle file upload
	const handleFileSelect = useCallback((files: FileList | null) => {
		if (!files) return;

		const newUploads: UploadingFile[] = Array.from(files).map(file => ({
			id: Math.random().toString(36).slice(2, 11),
			name: file.name,
			progress: 0,
			file,
		}));

		setUploadingFiles(prev => [...prev, ...newUploads]);

		// Simulate upload progress
		newUploads.forEach(upload => {
			const interval = setInterval(() => {
				setUploadingFiles(prev => 
					prev.map(u => 
						u.id === upload.id 
							? { ...u, progress: Math.min(u.progress + 10, 100) }
							: u
					)
				);
			}, 200);

			// Complete upload after 2 seconds
			setTimeout(() => {
				clearInterval(interval);
				setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
				
				// Add to media items
				const mediaType = upload.file.type.startsWith('image/') ? 'image' :
					upload.file.type.startsWith('video/') ? 'video' : 'document';
				
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

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		handleFileSelect(e.dataTransfer.files);
	}, [handleFileSelect]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
	}, []);

	const toggleSelection = (id: string) => {
		setSelectedItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
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
			case 'image':
				return <FileImage className="w-5 h-5" />;
			case 'video':
				return <FileVideo className="w-5 h-5" />;
			default:
				return <File className="w-5 h-5" />;
		}
	};

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
			<div className="flex items-center justify-between pb-6 border-b border-gray-100">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
						Media Library
					</h1>
					<p className="text-sm text-gray-500">
						Upload and manage your images, videos, and documents
					</p>
				</div>
				<Button
					onClick={() => fileInputRef.current?.click()}
					className="bg-gray-900 hover:bg-gray-800 text-white shadow-none"
				>
					<Upload className="w-4 h-4 mr-2" />
					Upload Media
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*,video/*,.pdf,.doc,.docx"
					onChange={(e) => handleFileSelect(e.target.files)}
					className="hidden"
				/>
			</div>

			{/* Filters and Controls */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex items-center justify-between flex-wrap gap-4"
			>
				<div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
					{[
						{ id: 'all', label: 'All Media', icon: Grid3X3 },
						{ id: 'images', label: 'Images', icon: ImageIcon },
						{ id: 'videos', label: 'Videos', icon: Video },
						{ id: 'documents', label: 'Documents', icon: File },
					].map(filter => {
						const Icon = filter.icon;
						return (
							<motion.button
								key={filter.id}
								onClick={() => setActiveFilter(filter.id as MediaType)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
									activeFilter === filter.id
										? 'bg-gray-900 text-white'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
								}`}
								whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
								whileTap={!prefersReducedMotion ? { scale: 0.99 } : {}}
							>
								<Icon className="w-4 h-4" />
								{filter.label}
							</motion.button>
						);
					})}
				</div>

				<div className="flex items-center gap-3">
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
						<input
							type="text"
							placeholder="Search media..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-white border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all"
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
							className={`transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
							aria-label="Grid view"
						>
							<Grid3X3 className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode('list')}
							className={`transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'hover:bg-gray-100'}`}
							aria-label="List view"
						>
							<List className="w-4 h-4" />
						</Button>
					</motion.div>
				</div>
			</motion.div>

			{/* Selection Actions */}
			<AnimatePresence>
				{selectedItems.size > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
								<Check className="w-5 h-5 text-white" />
							</div>
							<div>
								<p className="font-medium text-gray-900">
									{selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
								</p>
								<p className="text-sm text-gray-600">
									Choose an action to perform on selected items
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
								<Download className="w-4 h-4 mr-2" />
								Download
							</Button>
							<Button variant="destructive" size="sm">
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedItems(new Set())}
							>
								Cancel
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Uploading Files */}
			<AnimatePresence>
				{uploadingFiles.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="space-y-2"
					>
						{uploadingFiles.map(file => (
							<Card key={file.id} variant="default" className="overflow-hidden border border-gray-200 shadow-none">
								<CardContent className="p-4">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
											<Upload className="w-5 h-5 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-900 truncate mb-1">
												{file.name}
											</p>
											<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
												<motion.div
													className="h-full bg-gray-900"
													initial={{ width: 0 }}
													animate={{ width: `${file.progress}%` }}
													transition={{ duration: 0.3 }}
												/>
											</div>
										</div>
										<span className="text-sm font-medium text-gray-600">
											{file.progress}%
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Loading State */}
			{isLoading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<div className={viewMode === 'grid' 
						? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
						: 'space-y-3'
					}>
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<Skeleton key={i} className={viewMode === 'grid' ? 'h-48' : 'h-20'} />
						))}
					</div>
				</motion.div>
			)}

			{/* Empty State */}
			{!isLoading && mediaItems.length === 0 && (
				<EmptyState
					icon={<ImageIcon className="w-10 h-10" />}
					title="No Media Yet"
					description="Upload images, videos, and documents to use in your social media posts. Drag and drop files or click the upload button."
					iconGradient="from-gray-100 to-gray-200"
					action={{
						label: 'Upload Media',
						onClick: () => fileInputRef.current?.click(),
						icon: <Upload className="w-4 h-4" />,
					}}
				/>
			)}

			{/* No Results State */}
			{!isLoading && mediaItems.length > 0 && filteredMedia.length === 0 && (
				<EmptyState
					icon={<Search className="w-10 h-10" />}
					title="No Results Found"
					description={`No media matches your ${searchQuery ? 'search query' : 'filter criteria'}. Try adjusting your filters or search terms.`}
					iconGradient="from-gray-100 to-gray-200"
					action={{
						label: 'Clear Filters',
						onClick: () => {
							setSearchQuery('');
							setActiveFilter('all');
						},
					}}
				/>
			)}

			{/* Media Grid/List */}
			<AnimatePresence mode="wait">
				{!isLoading && filteredMedia.length > 0 && (
					<motion.div
						key={viewMode}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						{viewMode === 'grid' ? (
							<motion.div
								className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
								variants={containerVariants}
								initial="hidden"
								animate="visible"
							>
								{filteredMedia.map((item) => (
									<motion.div
										key={item.id}
										variants={itemVariants}
										whileHover={!prefersReducedMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
									>
										<Card
											variant="default"
											className="bg-white border border-gray-200 shadow-sm overflow-hidden group cursor-pointer"
											onClick={() => toggleSelection(item.id)}
										>
											<div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
												{item.type === 'image' && item.thumbnail ? (
													<img
														src={item.thumbnail}
														alt={item.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
															<span className="text-white">{getMediaIcon(item.type)}</span>
														</div>
													</div>
												)}
												
												{/* Overlay */}
												<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<div className="absolute bottom-0 left-0 right-0 p-3 text-white">
														<p className="text-xs font-medium truncate">
															{item.name}
														</p>
													</div>
												</div>

												{/* Selection Checkbox */}
												<div className="absolute top-2 left-2">
													<motion.div
														initial={false}
														animate={{
															scale: selectedItems.has(item.id) ? 1 : 0,
															opacity: selectedItems.has(item.id) ? 1 : 0,
														}}
														className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center shadow-lg"
													>
														<Check className="w-4 h-4 text-white" />
													</motion.div>
												</div>

												{/* Actions */}
												<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
														onClick={(e) => {
															e.stopPropagation();
														}}
														aria-label="More options"
													>
														<MoreVertical className="w-4 h-4 text-gray-700" />
													</button>
												</div>
											</div>
											<CardContent className="p-3">
												<p className="text-xs text-gray-600 truncate mb-1">
													{item.name}
												</p>
												<div className="flex items-center justify-between text-xs text-gray-500">
													<span>{formatFileSize(item.size)}</span>
													<span>{item.uploadedAt.toLocaleDateString()}</span>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</motion.div>
						) : (
							<motion.div
								className="space-y-2"
								variants={containerVariants}
								initial="hidden"
								animate="visible"
							>
								{filteredMedia.map((item) => (
									<motion.div
										key={item.id}
										variants={itemVariants}
										whileHover={!prefersReducedMotion ? { x: 4, transition: { duration: 0.2 } } : {}}
									>
										<Card
											variant="default"
											className="bg-white border border-gray-200 shadow-sm group cursor-pointer"
											onClick={() => toggleSelection(item.id)}
										>
											<CardContent className="p-4">
												<div className="flex items-center gap-4">
													<div className="relative">
														<div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
															{item.type === 'image' && item.thumbnail ? (
																<img
																	src={item.thumbnail}
																	alt={item.name}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center">
																	<div className="text-gray-900">
																		{getMediaIcon(item.type)}
																	</div>
																</div>
															)}
														</div>
														{selectedItems.has(item.id) && (
															<div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
																<Check className="w-3 h-3 text-white" />
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 truncate mb-1">
															{item.name}
														</p>
														<div className="flex items-center gap-4 text-sm text-gray-600">
															<span className="flex items-center gap-1">
																{getMediaIcon(item.type)}
																{item.type}
															</span>
															<span>{formatFileSize(item.size)}</span>
															<span>{item.uploadedAt.toLocaleDateString()}</span>
														</div>
													</div>
													<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
															onClick={(e) => {
																e.stopPropagation();
															}}
															aria-label="Download"
														>
															<Download className="w-4 h-4 text-gray-700" />
														</button>
														<button
															className="p-2 hover:bg-red-50 rounded-lg transition-colors"
															onClick={(e) => {
																e.stopPropagation();
															}}
															aria-label="Delete"
														>
															<Trash2 className="w-4 h-4 text-red-600" />
														</button>
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