import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIProviderType,
} from './ai-provider.interface';
import { DeepSeekProvider } from './deepseek.provider';
import { GeminiProvider } from './gemini.provider';
// Temporarily disabled - need refactoring
// import { OpenAIProvider } from './openai.provider';
// import { AnthropicProvider } from './anthropic.provider';

/**
 * AI Provider Factory
 * 
 * Manages all AI providers and handles:
 * - Runtime provider switching
 * - Automatic fallback on failure
 * - Cost-aware provider selection
 * - Health monitoring
 */
@Injectable()
export class AIProviderFactory {
  private readonly logger = new Logger(AIProviderFactory.name);
  private readonly providers: Map<AIProviderType, AIProvider>;
  private readonly providerHealth: Map<AIProviderType, boolean>;

  constructor(
    private configService: ConfigService,
    private deepseekProvider: DeepSeekProvider,
    private geminiProvider: GeminiProvider,
    // Temporarily disabled - need refactoring
    // private openaiProvider: OpenAIProvider,
    // private anthropicProvider: AnthropicProvider,
  ) {
    this.providers = new Map();
    this.providerHealth = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize all available providers
   */
  private initializeProviders(): void {
    // Register all providers
    this.providers.set(AIProviderType.DEEPSEEK, this.deepseekProvider);
    this.providers.set(AIProviderType.GEMINI, this.geminiProvider);
    // Temporarily disabled - need refactoring
    // this.providers.set(AIProviderType.OPENAI, this.openaiProvider);
    // this.providers.set(AIProviderType.CLAUDE, this.anthropicProvider);

    // Initialize health status
    this.providers.forEach((_, type) => {
      this.providerHealth.set(type, true);
    });

    this.logger.log(`Initialized ${this.providers.size} AI providers (DeepSeek, Gemini)`);
  }

  /**
   * Get a specific provider by name
   */
  getProvider(providerType: AIProviderType): AIProvider {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      throw new Error(`Provider ${providerType} not found or not configured`);
    }

    return provider;
  }

  /**
   * Get the optimal provider based on task complexity and budget
   */
  async getOptimalProvider(criteria?: {
    taskComplexity?: 'low' | 'medium' | 'high';
    maxBudget?: number;
    preferredProvider?: AIProviderType;
    requiresImageGeneration?: boolean;
  }): Promise<AIProvider> {
    // If preferred provider is specified and healthy, use it
    if (criteria?.preferredProvider) {
      const preferred = this.providers.get(criteria.preferredProvider);
      const isHealthy = this.providerHealth.get(criteria.preferredProvider);
      
      if (preferred && isHealthy) {
        return preferred;
      }
    }

    // Image generation requires specific providers
    if (criteria?.requiresImageGeneration) {
      return this.getProvider(AIProviderType.OPENAI); // Only OpenAI supports DALL-E
    }

    // Cost-optimized selection
    if (criteria?.maxBudget && criteria.maxBudget < 0.01) {
      // Very low budget - use cheapest provider
      return this.getProvider(AIProviderType.DEEPSEEK);
    }

    // Task complexity-based selection
    switch (criteria?.taskComplexity) {
      case 'low':
        // Simple tasks - use fastest/cheapest
        return this.getProvider(AIProviderType.DEEPSEEK);
      
      case 'medium':
        // Medium tasks - balance cost and quality
        return this.getProvider(AIProviderType.GEMINI);
      
      case 'high':
        // Complex tasks - use most capable
        return this.getProvider(AIProviderType.CLAUDE);
      
      default:
        return this.getDefaultProvider();
    }
  }

  /**
   * Get fallback provider when primary fails
   */
  getFallbackProvider(failedProvider: AIProviderType): AIProvider {
    // Fallback chain: DeepSeek → Gemini → Claude → OpenAI
    const fallbackChain: AIProviderType[] = [
      AIProviderType.DEEPSEEK,
      AIProviderType.GEMINI,
      AIProviderType.CLAUDE,
      AIProviderType.OPENAI,
    ];

    // Find next provider in chain
    const failedIndex = fallbackChain.indexOf(failedProvider);
    
    for (let i = failedIndex + 1; i < fallbackChain.length; i++) {
      const fallbackType = fallbackChain[i];
      const isHealthy = this.providerHealth.get(fallbackType);
      
      if (isHealthy) {
        this.logger.warn(`Falling back from ${failedProvider} to ${fallbackType}`);
        return this.getProvider(fallbackType);
      }
    }

    // If all providers in chain failed, try any healthy provider
    for (const [type, provider] of this.providers) {
      if (this.providerHealth.get(type) && type !== failedProvider) {
        this.logger.warn(`Using emergency fallback: ${type}`);
        return provider;
      }
    }

    throw new Error('All AI providers are unavailable');
  }

  /**
   * Get default provider from config
   */
  getDefaultProvider(): AIProvider {
    const defaultType = this.configService.get<string>('DEFAULT_AI_PROVIDER') as AIProviderType;
    
    if (defaultType && this.providers.has(defaultType)) {
      return this.getProvider(defaultType);
    }

    // Fallback to DeepSeek as default
    return this.getProvider(AIProviderType.DEEPSEEK);
  }

  /**
   * Mark provider as unhealthy
   */
  markProviderUnhealthy(providerType: AIProviderType): void {
    this.providerHealth.set(providerType, false);
    this.logger.warn(`Provider ${providerType} marked as unhealthy`);

    // Schedule health check after 5 minutes
    setTimeout(() => this.checkProviderHealth(providerType), 5 * 60 * 1000);
  }

  /**
   * Check provider health and update status
   */
  private async checkProviderHealth(providerType: AIProviderType): Promise<void> {
    try {
      const provider = this.providers.get(providerType);
      if (!provider) return;

      const health = await provider.checkHealth();
      this.providerHealth.set(providerType, health.available);

      if (health.available) {
        this.logger.log(`Provider ${providerType} is healthy again`);
      }
    } catch (error) {
      this.logger.error(`Health check failed for ${providerType}: ${error.message}`);
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];
    
    this.providerHealth.forEach((isHealthy, type) => {
      if (isHealthy) {
        available.push(type);
      }
    });

    return available;
  }

  /**
   * Estimate cost across all providers for comparison
   */
  async estimateCostAllProviders(request: any): Promise<Map<AIProviderType, number>> {
    const estimates = new Map<AIProviderType, number>();

    for (const [type, provider] of this.providers) {
      try {
        const estimate = await provider.estimateCost(request);
        estimates.set(type, estimate.estimatedCost);
      } catch (error) {
        this.logger.warn(`Cost estimation failed for ${type}: ${error.message}`);
      }
    }

    return estimates;
  }
}
