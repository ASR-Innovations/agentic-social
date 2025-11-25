/**
 * AI Provider Interface
 * 
 * All AI providers (DeepSeek, Claude, Gemini, OpenAI) must implement this interface.
 * This enables runtime provider switching and automatic fallback.
 */

export enum AIProviderType {
  DEEPSEEK = 'deepseek',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
}

export interface GenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface ImageGenerationOptions {
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
}

export interface TextResponse {
  text: string;
  tokensUsed: number;
  cost: number;
  model: string;
  finishReason?: string;
}

export interface ImageResponse {
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
  cost: number;
  model: string;
}

export interface AIRequest {
  prompt: string;
  type: 'text' | 'image';
  complexity: 'low' | 'medium' | 'high';
  maxBudget?: number;
  context?: string;
}

export interface CostEstimate {
  estimatedCost: number;
  estimatedTokens: number;
  confidence: number;
}

export interface ProviderHealth {
  available: boolean;
  latency?: number;
  errorRate?: number;
  lastChecked: Date;
}

/**
 * Base interface that all AI providers must implement
 */
export interface AIProvider {
  /**
   * Provider identification
   */
  readonly name: AIProviderType;
  readonly displayName: string;
  readonly supportedModels: string[];

  /**
   * Text generation
   */
  generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<TextResponse>;

  /**
   * Image generation
   */
  generateImage(
    prompt: string,
    options?: ImageGenerationOptions,
  ): Promise<ImageResponse>;

  /**
   * Cost estimation
   */
  estimateCost(request: AIRequest): Promise<CostEstimate>;

  /**
   * Health check
   */
  checkHealth(): Promise<ProviderHealth>;

  /**
   * Get default model for task type
   */
  getDefaultModel(taskType: 'simple' | 'complex' | 'creative'): string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  defaultModel?: string;
}

/**
 * Provider selection criteria
 */
export interface ProviderSelectionCriteria {
  taskComplexity: 'low' | 'medium' | 'high';
  maxBudget?: number;
  preferredProvider?: AIProviderType;
  requiresImageGeneration?: boolean;
  maxLatency?: number;
}
