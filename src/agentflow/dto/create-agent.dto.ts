import { IsString, IsEnum, IsOptional, IsNumber, IsObject, Min, Max, IsUUID } from 'class-validator';
import { AgentType } from '../interfaces/agent.interface';
import { AIProviderType } from '../../ai/providers/ai-provider.interface';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsEnum(AgentType)
  type: AgentType;

  @IsOptional()
  @IsUUID()
  socialAccountId?: string;

  @IsOptional()
  @IsEnum(AIProviderType)
  aiProvider?: AIProviderType;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsObject()
  personalityConfig?: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number;
    formality?: number;
    humor?: number;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  costBudget?: number;

  @IsOptional()
  @IsEnum(AIProviderType)
  fallbackProvider?: AIProviderType;
}

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AIProviderType)
  aiProvider?: AIProviderType;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsObject()
  personalityConfig?: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number;
    formality?: number;
    humor?: number;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  costBudget?: number;

  @IsOptional()
  @IsEnum(AIProviderType)
  fallbackProvider?: AIProviderType;

  @IsOptional()
  active?: boolean;
}

export class TestAgentDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsObject()
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

export class InstantCreateAgentDto {
  @IsUUID()
  socialAccountId: string;

  @IsEnum(AgentType)
  type: AgentType;
}

export class PersonalizeAgentDto {
  @IsString()
  message: string;
}
