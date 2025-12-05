'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  ChevronRight,
  Bot,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Search,
  Users,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from '@/components/ui/status-badge';
import { DashboardAgentsSkeleton } from '@/components/ui/skeleton-loader';
import { formatAgentType } from '../utils/formatters';

// Agent type icons
const agentTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  content_creator: Sparkles,
  strategy: TrendingUp,
  engagement: MessageSquare,
  analytics: BarChart3,
  trend_detection: Search,
  competitor_analysis: Users,
};

export interface Agent {
  id: string;
  name: string;
  type: string;
  active: boolean;
  tasksCompleted: number;
  lastRunAt?: string;
}

export interface AgentStatistics {
  totalAgents: number;
  activeAgents: number;
  totalTasksCompleted: number;
}

export interface AIAgentsStatusProps {
  agents: Agent[];
  statistics?: AgentStatistics;
  loading?: boolean;
  maxVisible?: number;
  onAgentClick?: (agentId: string) => void;
  onCreateAgent?: () => void;
  onViewAll?: () => void;
  className?: string;
}

/**
 * AgentCard Component
 * 
 * Individual agent display card
 */
function AgentCard({
  agent,
  onClick,
  delay = 0,
}: {
  agent: Agent;
  onClick?: () => void;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const AgentIcon = agentTypeIcons[agent.type] || Sparkles;

  const cardContent = (
    <div
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl overflow-hidden group',
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
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300" />
      
      {/* Agent Icon */}
      <div
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
          agent.active
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 group-hover:scale-105'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
        )}
      >
        <AgentIcon className="w-4 h-4" />
        {agent.active && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </div>

      {/* Agent Info */}
      <div className="relative flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
          {agent.name}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
          {formatAgentType(agent.type)}
        </p>
      </div>

      {/* Status Indicator */}
      <div className="relative">
        <StatusDot
          status={agent.active ? 'active' : 'inactive'}
          pulsing={agent.active}
          size="md"
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
 * AIAgentsStatus Component
 * 
 * Displays AI agents with their status featuring:
 * - Agent list with active/inactive indicators
 * - Statistics summary
 * - Empty state with CTA
 * - Loading skeleton
 */
export function AIAgentsStatus({
  agents,
  statistics,
  loading = false,
  maxVisible = 3,
  onAgentClick,
  onCreateAgent,
  onViewAll,
  className,
}: AIAgentsStatusProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Calculate statistics if not provided
  const stats = statistics || {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.active).length,
    totalTasksCompleted: agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0),
  };

  const visibleAgents = agents.slice(0, maxVisible);
  const hasMore = agents.length > maxVisible;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.6, duration: 0.4 },
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
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                AI Agents
              </h3>
            </div>
            <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 text-[10px] h-6 px-2.5 font-bold">
              {stats.activeAgents} active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <DashboardAgentsSkeleton />
          ) : agents.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                No agents yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Create AI agents to automate tasks
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg shadow-emerald-500/20 transition-all text-xs"
                onClick={onCreateAgent}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Agent
              </Button>
            </div>
          ) : (
            <>
              {/* Agent list */}
              <div className="space-y-1">
                {visibleAgents.map((agent, index) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onClick={onAgentClick ? () => onAgentClick(agent.id) : undefined}
                    delay={index * 100}
                  />
                ))}
              </div>

              {/* View all button */}
              {hasMore && onViewAll && (
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mt-2"
                  onClick={onViewAll}
                >
                  View all {agents.length} agents
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}

              {/* Statistics */}
              {stats.totalTasksCompleted > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tasks completed
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.totalTasksCompleted.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AIAgentsStatus;
