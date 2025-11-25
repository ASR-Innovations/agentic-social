import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIProviderFactory } from './providers/provider.factory';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { GeminiProvider } from './providers/gemini.provider';
// Temporarily disabled - need refactoring
// import { OpenAIProvider } from './providers/openai.provider';
// import { AnthropicProvider } from './providers/anthropic.provider';

/**
 * AI Module
 * 
 * Provides AI services and providers for the application.
 * Manages all AI provider integrations and factory.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    DeepSeekProvider,
    GeminiProvider,
    // Temporarily disabled - need refactoring
    // OpenAIProvider,
    // AnthropicProvider,
    AIProviderFactory,
  ],
  exports: [
    AIProviderFactory,
    DeepSeekProvider,
    GeminiProvider,
    // Temporarily disabled - need refactoring
    // OpenAIProvider,
    // AnthropicProvider,
  ],
})
export class AIModule {}
