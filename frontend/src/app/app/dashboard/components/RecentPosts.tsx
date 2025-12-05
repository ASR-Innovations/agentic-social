'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ChevronRight,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Globe,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getPostStatusBadgeProps } from '@/components/ui/status-badge';
import { DashboardPostsSkeleton } from '@/components/ui/skeleton-loader';
import { XIcon } from '@/components/icons/XIcon';
import { formatRelativeTime, truncateText, formatTime } from '../utils/formatters';

// Platform icons mapping
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: XIcon,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
};

export interface Post {
  id: string;
  title?: string;
  content: string;
  status: string;
  platforms?: Array<string | { platform: string; [key: string]: any }>;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  mediaUrls?: string[];
}

export interface RecentPostsProps {
  posts: Post[];
  loading?: boolean;
  maxVisible?: number;
  onPostClick?: (postId: string) => void;
  onViewAll?: () => void;
  onCreatePost?: () => void;
  className?: string;
}

/**
 * PostCard Component
 * 
 * Individual post display card
 */
function PostCard({
  post,
  onClick,
  delay = 0,
}: {
  post: Post;
  onClick?: () => void;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const statusProps = getPostStatusBadgeProps(post.status);
  const displayTitle = post.title || truncateText(post.content, 50) || 'Untitled';

  const cardContent = (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-xl overflow-hidden group',
        'hover:bg-gradient-to-r hover:from-gray-50 hover:to-white dark:hover:from-gray-800/50 dark:hover:to-gray-800/30',
        'transition-all duration-300',
        'border border-transparent hover:border-emerald-100/50 dark:hover:border-emerald-500/20',
        'hover:shadow-sm hover:shadow-emerald-500/5',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 min-w-0">
        {/* Status and date row */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <StatusBadge
            status={statusProps.status}
            label={statusProps.label}
            size="sm"
            showIcon={false}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
          
          {/* Scheduled time for scheduled posts */}
          {post.status === 'scheduled' && post.scheduledAt && (
            <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(post.scheduledAt)}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm text-gray-900 dark:text-white line-clamp-1">
          {displayTitle}
        </p>

        {/* Platform icons */}
        {post.platforms && post.platforms.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {post.platforms.slice(0, 4).map((platform, idx) => {
              // Handle both string and object formats
              const platformName = typeof platform === 'string' 
                ? platform 
                : (platform as any)?.platform || (platform as any)?.name || 'unknown';
              const PlatformIcon = platformIcons[platformName.toLowerCase()] || Globe;
              return (
                <div
                  key={`${platformName}-${idx}`}
                  className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  title={platformName}
                >
                  <PlatformIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
              );
            })}
            {post.platforms.length > 4 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                +{post.platforms.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Media thumbnail */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
          <img
            src={post.mediaUrls[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );

  if (!prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay / 1000, duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

/**
 * RecentPosts Component
 * 
 * Displays recent posts with their status featuring:
 * - Post list with status badges
 * - Platform icons
 * - Scheduled time display
 * - Empty state with CTA
 * - Loading skeleton
 */
export function RecentPosts({
  posts,
  loading = false,
  maxVisible = 5,
  onPostClick,
  onViewAll,
  onCreatePost,
  className,
}: RecentPostsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate status counts
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  const visiblePosts = posts.slice(0, maxVisible);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.4, duration: 0.4 },
    },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : 'hidden'}
      animate={prefersReducedMotion ? {} : 'visible'}
      variants={containerVariants}
      className={className}
    >
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 relative">
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white shadow-md shadow-gray-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{publishedCount}</span> published, <span className="text-blue-600 dark:text-blue-400 font-medium">{scheduledCount}</span> scheduled
                </p>
              </div>
            </div>
            {onViewAll && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                onClick={onViewAll}
              >
                View All
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <DashboardPostsSkeleton />
          ) : posts.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center shadow-sm">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                No posts yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Create your first post to get started
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 dark:from-white dark:to-gray-100 dark:hover:from-gray-100 dark:hover:to-gray-200 dark:text-gray-900 text-white shadow-md hover:shadow-lg transition-all"
                onClick={onCreatePost}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Post
              </Button>
            </div>
          ) : (
            // Posts list
            <div className="space-y-1">
              {visiblePosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={onPostClick ? () => onPostClick(post.id) : undefined}
                  delay={index * 100}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RecentPosts;
