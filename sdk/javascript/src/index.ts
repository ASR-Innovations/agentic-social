import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface AISocialConfig {
  apiKey?: string;
  accessToken?: string;
  baseURL?: string;
  timeout?: number;
}

export interface Post {
  id?: string;
  content: string;
  platforms: string[];
  scheduledAt?: string;
  media?: Media[];
  platformCustomizations?: Record<string, any>;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface Media {
  url: string;
  type: 'image' | 'video' | 'gif';
  thumbnailUrl?: string;
}

export interface AIGenerateRequest {
  prompt: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous';
  platforms?: string[];
  variations?: number;
  includeHashtags?: boolean;
  brandVoiceId?: string;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  platforms?: string[];
  metrics?: string[];
}

export interface ListeningQuery {
  name: string;
  keywords: string[];
  platforms: string[];
  languages?: string[];
  sentiment?: string[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

export class AISocialSDK {
  private client: AxiosInstance;
  private config: AISocialConfig;

  constructor(config: AISocialConfig) {
    this.config = {
      baseURL: config.baseURL || 'https://api.example.com',
      timeout: config.timeout || 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.getHeaders(),
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new AISocialError(
            error.response.data.error?.message || 'API Error',
            error.response.status,
            error.response.data.error?.code
          );
        }
        throw error;
      }
    );
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    } else if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/api/v1/auth/login', {
      email,
      password,
    });
    this.config.accessToken = response.data.data.accessToken;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    return response.data.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/api/v1/auth/refresh', {
      refreshToken,
    });
    this.config.accessToken = response.data.data.accessToken;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    return response.data.data;
  }

  // Posts
  async createPost(post: Post) {
    const response = await this.client.post('/api/v1/posts', post);
    return response.data.data;
  }

  async getPost(postId: string) {
    const response = await this.client.get(`/api/v1/posts/${postId}`);
    return response.data.data;
  }

  async listPosts(params?: {
    status?: string;
    platform?: string;
    limit?: number;
    cursor?: string;
  }) {
    const response = await this.client.get('/api/v1/posts', { params });
    return response.data;
  }

  async updatePost(postId: string, updates: Partial<Post>) {
    const response = await this.client.put(`/api/v1/posts/${postId}`, updates);
    return response.data.data;
  }

  async deletePost(postId: string) {
    await this.client.delete(`/api/v1/posts/${postId}`);
  }

  async publishPost(postId: string) {
    const response = await this.client.post(`/api/v1/posts/${postId}/publish`);
    return response.data.data;
  }

  async bulkCreatePosts(posts: Post[]) {
    const response = await this.client.post('/api/v1/posts/bulk', { posts });
    return response.data.data;
  }

  // AI
  async generateContent(request: AIGenerateRequest) {
    const response = await this.client.post('/api/v1/ai/generate', request);
    return response.data.data;
  }

  async optimizeContent(content: string, platform: string, goals?: string[]) {
    const response = await this.client.post('/api/v1/ai/optimize', {
      content,
      platform,
      optimizationGoals: goals,
    });
    return response.data.data;
  }

  async generateHashtags(content: string, platform: string, count: number = 30) {
    const response = await this.client.post('/api/v1/ai/hashtags', {
      content,
      platform,
      count,
    });
    return response.data.data;
  }

  async getStrategyRecommendations(goals: string[], platforms: string[], timeframe: string = '30_days') {
    const response = await this.client.post('/api/v1/ai/strategy', {
      goals,
      platforms,
      timeframe,
    });
    return response.data.data;
  }

  // Analytics
  async getAnalyticsOverview(query?: AnalyticsQuery) {
    const response = await this.client.get('/api/v1/analytics/overview', {
      params: query,
    });
    return response.data.data;
  }

  async getPostAnalytics(postId: string) {
    const response = await this.client.get(`/api/v1/analytics/posts/${postId}`);
    return response.data.data;
  }

  async getAudienceAnalytics() {
    const response = await this.client.get('/api/v1/analytics/audience');
    return response.data.data;
  }

  async generateReport(config: {
    name: string;
    dateRange: { start: string; end: string };
    metrics: string[];
    platforms: string[];
    format: 'pdf' | 'csv' | 'excel';
  }) {
    const response = await this.client.post('/api/v1/analytics/reports', config);
    return response.data.data;
  }

  // Social Listening
  async createListeningQuery(query: ListeningQuery) {
    const response = await this.client.post('/api/v1/listening/queries', query);
    return response.data.data;
  }

  async getMentions(queryId: string, params?: { limit?: number; cursor?: string }) {
    const response = await this.client.get('/api/v1/listening/mentions', {
      params: { queryId, ...params },
    });
    return response.data;
  }

  async getSentimentAnalysis(queryId: string, startDate?: string) {
    const response = await this.client.get('/api/v1/listening/sentiment', {
      params: { queryId, startDate },
    });
    return response.data.data;
  }

  async getTrendingTopics() {
    const response = await this.client.get('/api/v1/listening/trends');
    return response.data.data;
  }

  // Inbox
  async getInboxMessages(params?: {
    status?: string;
    platform?: string;
    limit?: number;
    cursor?: string;
  }) {
    const response = await this.client.get('/api/v1/inbox/messages', { params });
    return response.data;
  }

  async replyToMessage(messageId: string, content: string, useTemplate: boolean = false) {
    const response = await this.client.post(`/api/v1/inbox/messages/${messageId}/reply`, {
      content,
      useTemplate,
    });
    return response.data.data;
  }

  async assignMessage(messageId: string, userId: string) {
    const response = await this.client.put(`/api/v1/inbox/messages/${messageId}/assign`, {
      userId,
    });
    return response.data.data;
  }

  async createReplyTemplate(name: string, content: string, category: string) {
    const response = await this.client.post('/api/v1/inbox/templates', {
      name,
      content,
      category,
    });
    return response.data.data;
  }

  // Webhooks
  async createWebhook(config: WebhookConfig) {
    const response = await this.client.post('/api/v1/webhooks', config);
    return response.data.data;
  }

  async listWebhooks() {
    const response = await this.client.get('/api/v1/webhooks');
    return response.data.data;
  }

  async testWebhook(webhookId: string) {
    const response = await this.client.post(`/api/v1/webhooks/${webhookId}/test`);
    return response.data.data;
  }

  async deleteWebhook(webhookId: string) {
    await this.client.delete(`/api/v1/webhooks/${webhookId}`);
  }

  // Social Accounts
  async listSocialAccounts() {
    const response = await this.client.get('/api/v1/social-accounts');
    return response.data.data;
  }

  async connectSocialAccount(platform: string, authCode: string) {
    const response = await this.client.post('/api/v1/social-accounts/connect', {
      platform,
      authCode,
    });
    return response.data.data;
  }

  async disconnectSocialAccount(accountId: string) {
    await this.client.delete(`/api/v1/social-accounts/${accountId}`);
  }
}

export class AISocialError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AISocialError';
  }
}

export default AISocialSDK;
