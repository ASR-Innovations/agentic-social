import { AgentResult, AgentConfig } from '../interfaces/agent.interface';
import { AIProviderType } from '../../ai/providers/ai-provider.interface';

/**
 * Helper to create complete metadata object for AgentResult
 */
export function createMetadata(
  config: AgentConfig,
  tokensUsed: number,
  cost: number,
  duration: number,
  additionalMetadata: Record<string, any> = {},
): AgentResult['metadata'] {
  return {
    tokensUsed,
    cost,
    duration,
    model: config.model,
    provider: config.aiProvider as AIProviderType,
    ...additionalMetadata,
  };
}

/**
 * Helper to create error result
 */
export function createErrorResult(
  error: Error,
  config: AgentConfig,
  duration: number,
): AgentResult {
  return {
    success: false,
    output: {},
    error: error.message,
    metadata: createMetadata(config, 0, 0, duration),
  };
}
