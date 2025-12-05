import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIProviderFactory } from './providers/provider.factory';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenAIService } from './services/openai.service';
import { AnthropicService } from './services/anthropic.service';
import { AIRequest } from './entities/ai-request.entity';
import { TenantModule } from '../tenant/tenant.module';

/**
 * AI Module
 *
 * Provides AI services and providers for the application.
 * Manages all AI provider integrations and factory.
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AIRequest]),
    TenantModule,
  ],
  controllers: [AIController],
  providers: [
    AIService,
    OpenAIService,
    AnthropicService,
    DeepSeekProvider,
    GeminiProvider,
    AIProviderFactory,
  ],
  exports: [
    AIService,
    AIProviderFactory,
    DeepSeekProvider,
    GeminiProvider,
  ],
})
export class AIModule {}
