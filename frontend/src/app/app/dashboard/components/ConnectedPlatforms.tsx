'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  ChevronRight,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getAccountStatusBadgeProps } from '@/components/ui/status-badge';
import { DashboardPlatformsSkeleton } from '@/components/ui/skeleton-loader';
import { XIcon } from '@/components/icons/XIcon';
import { formatPlatformName } from '../utils/formatters';

// Platform icons mapping
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: XIcon,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  // Add more as needed
};

export interface SocialAccount {
  id: string;
  platform: string;
  displayName: string;
  username?: string;
  status: 'active' | 'warning' | 'error' | 'disconnected';
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface ConnectedPlatformsProps {
  accounts: SocialAccount[];
  loading?: boolean;
  onManageClick?: () => void;
  onAccountClick?: (accountId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * PlatformCard Component
 * 
 * Individual platform account card
 */
function PlatformCard({
  account,
  onClick,
  delay = 0,
}: {
  account: SocialAccount;
  onClick?: () => void;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const PlatformIcon = platformIcons[account.platform.toLowerCase()] || Globe;
  const statusProps = getAccountStatusBadgeProps(account.status);

  const cardContent = (
    <div
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl overflow-hidden group',
        'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30',
        'border border-gray-100 dark:border-gray-700/50',
        'hover:border-emerald-200/50 dark:hover:border-emerald-500/30',
        'hover:shadow-md hover:shadow-emerald-500/5',
        'transition-all duration-300',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />
      
      {/* Platform Icon */}
      <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:border-emerald-200/50 dark:group-hover:border-emerald-500/30 transition-all duration-300">
        {account.avatarUrl ? (
          <img
            src={account.avatarUrl}
            alt={account.displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <PlatformIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />
        )}
      </div>

      {/* Account Info */}
      <div className="relative flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
          {account.displayName || account.username}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {formatPlatformName(account.platform)}
        </p>
      </div>

      {/* Status Badge */}
      <div className="relative">
        <StatusBadge
          status={statusProps.status}
          label={statusProps.label}
          pulsing={account.status === 'active'}
          size="sm"
          showIcon={false}
        />
      </div>
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
 * ConnectedPlatforms Component
 * 
 * Displays all connected social media platforms with:
 * - Platform icons and names
 * - Connection status indicators
 * - Empty state with CTA
 * - Loading skeleton
 */
export function ConnectedPlatforms({
  accounts,
  loading = false,
  onManageClick,
  onAccountClick,
  onRefresh,
  className,
}: ConnectedPlatformsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.4 },
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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Connected Platforms
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                  onClick={onRefresh}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
              {onManageClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                  onClick={onManageClick}
                >
                  Manage
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <DashboardPlatformsSkeleton />
          ) : accounts.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center shadow-sm">
                <Globe className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                No platforms connected
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Connect your social accounts to get started
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg shadow-emerald-500/20 transition-all"
                onClick={onManageClick}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Connect Platform
              </Button>
            </div>
          ) : (
            // Platform grid
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((account, index) => (
                <PlatformCard
                  key={account.id}
                  account={account}
                  onClick={onAccountClick ? () => onAccountClick(account.id) : undefined}
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

export default ConnectedPlatforms;
