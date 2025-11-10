import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIRequest } from './entities/ai-request.entity';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { OpenAIService } from './services/openai.service';
import { AnthropicService } from './services/anthropic.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([AIRequest]), TenantModule],
  controllers: [AIController],
  providers: [AIService, OpenAIService, AnthropicService],
  exports: [AIService, OpenAIService, AnthropicService],
})
export class AIModule {}
