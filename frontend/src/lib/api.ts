import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { ErrorType, APIError } from './query-client';

// Types
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  CreatePostRequest,
  UpdatePostRequest,
  MediaUploadResponse,
  AnalyticsRequest,
  AIGenerateRequest,
  AIGenerateResponse,
  SocialAccountConnectRequest,
  TeamInviteRequest,
  WebhookRequest,
  BulkActionRequest,
  SearchRequest,
  ExportRequest,
  Agent,
  AgentStatistics,
  AgentActivity,
  UpdateAgentConfigRequest,
  InstantCreateAgentRequest,
  PersonalizeAgentRequest
} from '@/types/api';

class ApiClient {
  public client: AxiosInstance; // Made public for OAuth flow
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant ID if available
        const tenantId = this.getTenantId();
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getTenantId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('tenant_id');
  }

  private handleError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new APIError(
            ErrorType.AUTH_ERROR,
            'Your session has expired. Please log in again.',
            401
          );
        
        case 403:
          toast.error('Access denied. You don\'t have permission to perform this action.');
          throw new APIError(
            ErrorType.AUTH_ERROR,
            'Access denied',
            403
          );
        
        case 404:
          toast.error('Resource not found.');
          throw new APIError(
            ErrorType.NOT_FOUND_ERROR,
            'Resource not found',
            404
          );
        
        case 429:
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
          toast.error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
          throw new APIError(
            ErrorType.RATE_LIMIT_ERROR,
            'Rate limit exceeded',
            429,
            retryAfter
          );
        
        case 500:
        case 502:
        case 503:
          toast.error('Server error. Our team has been notified. Please try again later.');
          throw new APIError(
            ErrorType.SERVER_ERROR,
            data?.message || 'Server error',
            status
          );
        
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
          throw new APIError(
            ErrorType.SERVER_ERROR,
            data?.message || 'Unknown error',
            status
          );
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection and try again.');
      throw new APIError(
        ErrorType.NETWORK_ERROR,
        'Network error. Please check your connection.'
      );
    } else {
      toast.error('An unexpected error occurred.');
      throw new APIError(
        ErrorType.SERVER_ERROR,
        error.message || 'Unknown error'
      );
    }
  }

  private clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('user_data');
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post('/auth/login', data);
      const authData = response.data;
      
      // Store auth data
      if (typeof window !== 'undefined' && authData.access_token) {
        localStorage.setItem('auth_token', authData.access_token);
        localStorage.setItem('tenant_id', authData.tenant.id);
        localStorage.setItem('user_data', JSON.stringify(authData.user));
      }
      
      return authData;
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Remove agreeToTerms as backend doesn't expect it
    const { agreeToTerms, ...registerData } = data as any;
    
    try {
      const response = await this.client.post('/auth/register', registerData);
      const authData = response.data;
      
      // Store auth data
      if (typeof window !== 'undefined' && authData.access_token) {
        localStorage.setItem('auth_token', authData.access_token);
        localStorage.setItem('tenant_id', authData.tenant.id);
        localStorage.setItem('user_data', JSON.stringify(authData.user));
      }
      
      return authData;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  async getProfile(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/auth/profile',
    });
    return response.data;
  }

  // Users endpoints
  async getUsers(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/users',
    });
    return response.data;
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/users',
      data,
    });
    return response.data;
  }

  async getUser(id: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/users/${id}`,
    });
    return response.data;
  }

  async updateUser(id: string, data: any): Promise<any> {
    const response = await this.request({
      method: 'PATCH',
      url: `/users/${id}`,
      data,
    });
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/users/${id}`,
    });
  }

  // Tenants endpoints
  async getTenants(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/tenants',
    });
    return response.data;
  }

  async createTenant(data: { name: string }): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/tenants',
      data,
    });
    return response.data;
  }

  async getTenant(id: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/tenants/${id}`,
    });
    return response.data;
  }

  async updateTenant(id: string, data: any): Promise<any> {
    const response = await this.request({
      method: 'PATCH',
      url: `/tenants/${id}`,
      data,
    });
    return response.data;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/tenants/${id}`,
    });
  }

  // Content endpoints
  async getPosts(params?: any): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/posts',
      params,
    });
    return response.data;
  }

  async createPost(data: CreatePostRequest): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/posts',
      data,
    });
    return response.data;
  }

  async updatePost(data: UpdatePostRequest): Promise<any> {
    const response = await this.request({
      method: 'PATCH',
      url: `/posts/${data.id}`,
      data,
    });
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/posts/${id}`,
    });
  }

  async publishPost(id: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/posts/${id}/publish`,
    });
    return response.data;
  }

  async getPostsCalendar(start: string, end: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/posts/calendar',
      params: { start, end },
    });
    return response.data;
  }

  async schedulePost(id: string, scheduledAt: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/posts/${id}/schedule`,
      data: { postId: id, scheduledAt },
    });
    return response.data;
  }

  async cancelScheduledPost(id: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/posts/${id}/cancel`,
    });
    return response.data;
  }

  async updatePostPlatforms(id: string, data: any): Promise<any> {
    const response = await this.request({
      method: 'PATCH',
      url: `/posts/${id}/platforms`,
      data,
    });
    return response.data;
  }

  async duplicatePost(id: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/posts/${id}/duplicate`,
    });
    return response.data;
  }

  // Media endpoints
  async uploadMedia(file: File, folder?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = folder ? `/media/upload/${folder}` : '/media/upload';
    
    const response = await this.request<MediaUploadResponse>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data!;
  }

  async deleteMedia(key: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/media/${key}`,
    });
  }

  async getMediaLibrary(params?: any): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/media',
      params,
    });
    return response.data;
  }

  // Analytics endpoints
  async getTenantAnalytics(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/analytics/tenant',
    });
    return response.data;
  }

  async getPostAnalytics(postId: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/analytics/posts/${postId}`,
    });
    return response.data;
  }

  // Legacy analytics methods (kept for backward compatibility)
  async getAnalytics(params?: AnalyticsRequest): Promise<any> {
    // Redirect to tenant analytics as default
    return this.getTenantAnalytics();
  }

  async getPlatformAnalytics(platform: string, params?: any): Promise<any> {
    // This endpoint doesn't exist on backend yet
    // Return tenant analytics filtered by platform
    const data = await this.getTenantAnalytics();
    return data.byPlatform?.[platform] || {};
  }

  async getCompetitorAnalytics(params?: any): Promise<any> {
    // This endpoint doesn't exist on backend yet
    throw new Error('Competitor analytics endpoint not yet implemented on backend');
  }

  // AI endpoints
  async generateContent(data: AIGenerateRequest): Promise<AIGenerateResponse> {
    const response = await this.request<AIGenerateResponse>({
      method: 'POST',
      url: '/ai/generate',
      data,
    });
    return response.data!;
  }

  async getAIUsage(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/ai/usage',
    });
    return response.data;
  }

  async getAIHistory(options?: { type?: string; limit?: number; offset?: number }): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/ai/history',
      params: options,
    });
    return response.data;
  }

  async generateCaption(data: {
    topic: string;
    tone?: string;
    platform?: string;
    variations?: number;
    keywords?: string[];
    maxLength?: number;
  }): Promise<{ captions: string[]; requestId: string }> {
    const response = await this.request<{ captions: string[]; requestId: string }>({
      method: 'POST',
      url: '/ai/generate/caption',
      data,
    });
    return response.data!;
  }

  async generateAIContent(data: {
    prompt: string;
    contentType?: string;
    tone?: string;
    targetAudience?: string;
    variations?: number;
  }): Promise<{ content: string[]; requestId: string }> {
    const response = await this.request<{ content: string[]; requestId: string }>({
      method: 'POST',
      url: '/ai/generate/content',
      data,
    });
    return response.data!;
  }

  async generateImage(data: {
    prompt: string;
    style?: string;
    size?: string;
    n?: number;
  }): Promise<{ images: { url: string; revisedPrompt?: string }[]; requestId: string }> {
    const response = await this.request<{ images: { url: string; revisedPrompt?: string }[]; requestId: string }>({
      method: 'POST',
      url: '/ai/generate/image',
      data,
    });
    return response.data!;
  }

  async generateHashtags(data: {
    content: string;
    platform?: string;
    count?: number;
  }): Promise<{ hashtags: string[]; requestId: string }> {
    const response = await this.request<{ hashtags: string[]; requestId: string }>({
      method: 'POST',
      url: '/ai/generate/hashtags',
      data,
    });
    return response.data!;
  }

  async improveContent(data: {
    content: string;
    improvementType?: string;
    tone?: string;
  }): Promise<{ improvedContent: string; suggestions: string[]; requestId: string }> {
    const response = await this.request<{ improvedContent: string; suggestions: string[]; requestId: string }>({
      method: 'POST',
      url: '/ai/improve',
      data,
    });
    return response.data!;
  }

  // AgentFlow endpoints
  async getAgents(socialAccountId?: string): Promise<Agent[]> {
    try {
      const response = await this.client.get('/agents', {
        params: socialAccountId ? { socialAccountId } : undefined,
      });
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  async createAgent(data: {
    type: string;
    name: string;
    socialAccountId?: string;
    settings?: Record<string, any>;
  }): Promise<Agent> {
    try {
      const response = await this.client.post('/agents', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createAgentInstant(data: InstantCreateAgentRequest): Promise<Agent> {
    try {
      const response = await this.client.post('/agents/instant', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<Agent> {
    try {
      const response = await this.client.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      await this.client.delete(`/agents/${agentId}`);
    } catch (error) {
      throw error;
    }
  }

  async testAgent(agentId: string, prompt: string): Promise<any> {
    try {
      const response = await this.client.post(`/agents/${agentId}/test`, { prompt });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async executeAgentTask(agentId: string, data: {
    taskType: string;
    input: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await this.client.post(`/agents/${agentId}/execute`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async personalizeAgent(agentId: string, message: string): Promise<any> {
    try {
      const response = await this.client.post(`/agents/${agentId}/personalize`, { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAgentStatistics(): Promise<AgentStatistics> {
    try {
      const response = await this.client.get('/agents/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async activateAgent(agentId: string): Promise<Agent> {
    try {
      const response = await this.client.post(`/agents/${agentId}/activate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deactivateAgent(agentId: string): Promise<Agent> {
    try {
      const response = await this.client.post(`/agents/${agentId}/deactivate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAgentActivity(): Promise<AgentActivity[]> {
    try {
      const response = await this.client.get('/agents/activity');
      return response.data || [];
    } catch (error) {
      throw error;
    }
  }

  async updateAgentConfig(agentId: string, config: UpdateAgentConfigRequest): Promise<Agent> {
    try {
      const response = await this.client.patch(`/agents/${agentId}`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Social accounts endpoints
  async getSocialAccounts(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/social-accounts',
    });
    return response.data;
  }

  async connectSocialAccount(data: SocialAccountConnectRequest): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/social-accounts/connect',
      data,
    });
    return response.data;
  }

  async disconnectSocialAccount(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/social-accounts/${id}`,
    });
  }

  async getSocialAccountAuthUrl(platform: string): Promise<{ url: string; state: string }> {
    const response = await this.request({
      method: 'GET',
      url: `/social-accounts/auth-url/${platform}`,
    });
    return response.data!;
  }

  async refreshSocialAccount(id: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/social-accounts/${id}/refresh`,
    });
    return response.data;
  }

  async syncSocialAccount(id: string): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/social-accounts/${id}/sync`,
    });
    return response.data;
  }

  async getSocialAccountHealth(id: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/social-accounts/${id}/health`,
    });
    return response.data;
  }

  async getConfiguredPlatforms(): Promise<string[]> {
    const response = await this.request({
      method: 'GET',
      url: '/social-accounts/platforms/configured',
    });
    return response.data!.platforms || [];
  }

  // Inbox endpoints
  async getConversations(params?: any): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/inbox/conversations',
      params,
    });
    return response.data;
  }

  async getMessages(conversationId: string, params?: any): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/inbox/conversations/${conversationId}/messages`,
      params,
    });
    return response.data;
  }

  async sendMessage(conversationId: string, data: any): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: `/inbox/conversations/${conversationId}/messages`,
      data,
    });
    return response.data;
  }

  // Team endpoints
  async getTeamMembers(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/team/members',
    });
    return response.data;
  }

  async inviteTeamMember(data: TeamInviteRequest): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/team/invite',
      data,
    });
    return response.data;
  }

  async removeTeamMember(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/team/members/${id}`,
    });
  }

  // Settings endpoints
  async getSettings(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/settings',
    });
    return response.data;
  }

  async updateSettings(data: any): Promise<any> {
    const response = await this.request({
      method: 'PATCH',
      url: '/settings',
      data,
    });
    return response.data;
  }

  // Webhooks endpoints
  async getWebhooks(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/webhooks',
    });
    return response.data;
  }

  async createWebhook(data: WebhookRequest): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/webhooks',
      data,
    });
    return response.data;
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/webhooks/${id}`,
    });
  }

  // Bulk actions
  async bulkAction(data: BulkActionRequest): Promise<any> {
    const response = await this.request({
      method: 'POST',
      url: '/bulk-actions',
      data,
    });
    return response.data;
  }

  // Search
  async search(params: SearchRequest): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/search',
      params,
    });
    return response.data;
  }

  // Export
  async exportData(data: ExportRequest): Promise<Blob> {
    const response = await this.client.request({
      method: 'POST',
      url: '/export',
      data,
      responseType: 'blob',
    });
    return response.data;
  }

  // Notifications
  async getNotifications(params?: any): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/notifications',
      params,
    });
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request({
      method: 'PATCH',
      url: `/notifications/${id}/read`,
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request({
      method: 'PATCH',
      url: '/notifications/read-all',
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;