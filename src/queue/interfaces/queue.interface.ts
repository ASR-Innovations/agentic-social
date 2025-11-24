import { JobsOptions } from 'bullmq';

/**
 * Queue job priority levels
 */
export enum JobPriority {
  CRITICAL = 1,
  HIGH = 3,
  NORMAL = 5,
  LOW = 7,
  BACKGROUND = 10,
}

/**
 * Queue names enum for type safety
 */
export enum QueueName {
  POST_PUBLISHING = 'post-publishing',
  ANALYTICS_COLLECTION = 'analytics-collection',
  SOCIAL_LISTENING = 'social-listening',
  MEDIA_PROCESSING = 'media-processing',
  EMAIL_NOTIFICATIONS = 'email-notifications',
  WEBHOOK_DELIVERY = 'webhook-delivery',
  REPORT_GENERATION = 'report-generation',
  DATA_EXPORT = 'data-export',
  AI_PROCESSING = 'ai-processing',
  MAINTENANCE = 'maintenance',
}

/**
 * Job status enum
 */
export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
}

/**
 * Base job data interface
 */
export interface BaseJobData {
  workspaceId: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Job options with defaults
 */
export interface QueueJobOptions extends JobsOptions {
  priority?: JobPriority;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean | number | { age?: number; count?: number };
  removeOnFail?: boolean | number | { age?: number; count?: number };
}

/**
 * Queue statistics interface
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  total: number;
}

/**
 * Queue health status
 */
export interface QueueHealth {
  queueName: string;
  status: 'healthy' | 'warning' | 'critical';
  stats: QueueStats;
  issues: string[];
}

/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  summary: {
    totalQueues: number;
    totalWaiting: number;
    totalActive: number;
    totalCompleted: number;
    totalFailed: number;
    totalDelayed: number;
    pausedQueues: number;
    totalPending: number;
  };
  queues: Record<string, QueueHealth>;
}

/**
 * Job result interface
 */
export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
