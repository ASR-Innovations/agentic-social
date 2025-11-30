// API Request/Response Types

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
    planTier: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantName: string;
  planTier?: string;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  socialAccountIds: string[];
  scheduledAt?: string;
  mediaUrls?: string[];
  type?: string;
  firstComment?: string;
  location?: string;
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface MediaUploadResponse {
  id: string;
  url: string;
  cdnUrl: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  platforms?: string[];
  metrics?: string[];
}

export interface AIGenerateRequest {
  prompt: string;
  type: 'text' | 'image' | 'caption' | 'hashtags';
  platform?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  context?: Record<string, any>;
}

export interface AIGenerateResponse {
  content: string;
  alternatives?: string[];
  confidence: number;
  tokensUsed: number;
  cost: number;
}

export interface SocialAccountConnectRequest {
  platform: string;
  code: string;
  redirectUri?: string;
  metadata?: Record<string, any>;
}

export interface TeamInviteRequest {
  email: string;
  role: string;
  permissions?: string[];
}

export interface WebhookRequest {
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
}

export interface BulkActionRequest {
  action: 'delete' | 'publish' | 'schedule' | 'cancel';
  itemIds: string[];
  data?: Record<string, any>;
}

export interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'media' | 'conversations' | 'users';
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface ExportRequest {
  type: 'posts' | 'analytics' | 'conversations' | 'media';
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

// AgentFlow Types
export type AgentType = 
  | 'content_creator'
  | 'strategy'
  | 'engagement'
  | 'analytics'
  | 'trend_detection'
  | 'competitor_analysis';

export type AIProviderType = 
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek';

export interface Agent {
  id: string;
  tenantId: string;
  socialAccountId?: string | null;
  name: string;
  type: AgentType;
  aiProvider: AIProviderType;
  model: string;
  personalityConfig: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number;
    formality?: number;
    humor?: number;
  };
  active: boolean;
  costBudget: number;
  fallbackProvider: AIProviderType | null;
  usageStats: {
    totalTasks?: number;
    successfulTasks?: number;
    failedTasks?: number;
    totalCost?: number;
    averageDuration?: number;
    lastUsedAt?: string;
  };
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InstantCreateAgentRequest {
  socialAccountId: string;
  type: AgentType;
}

export interface PersonalizeAgentRequest {
  message: string;
}

export interface AgentStatistics {
  totalAgents: number;
  activeAgents: number;
  byType: Record<AgentType, number>;
  totalCost: number;
  totalTasks: number;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  agentName: string;
  agentType: AgentType;
  action: string;
  status: 'completed' | 'failed' | 'in_progress';
  timestamp: string;
  metadata: Record<string, any>;
}

export interface UpdateAgentConfigRequest {
  name?: string;
  aiProvider?: AIProviderType;
  model?: string;
  personalityConfig?: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number;
    formality?: number;
    humor?: number;
  };
  costBudget?: number;
  fallbackProvider?: AIProviderType;
  metadata?: Record<string, any>;
}