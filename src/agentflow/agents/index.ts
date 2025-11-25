/**
 * AgentFlow Agents Index
 * 
 * Central export point for all AI agents in the AgentFlow SDK.
 * Import agents from this file for cleaner imports throughout the application.
 * 
 * @example
 * ```typescript
 * import { ContentCreatorAgent, StrategyAgent } from './agents';
 * ```
 */

export { BaseAgent } from './base-agent';
export { ContentCreatorAgent } from './content-creator.agent';
export { StrategyAgent } from './strategy.agent';
export { EngagementAgent } from './engagement.agent';
export { AnalyticsAgent } from './analytics.agent';
export { TrendDetectionAgent } from './trend-detection.agent';
export { CompetitorAnalysisAgent } from './competitor-analysis.agent';

/**
 * Agent Registry
 * 
 * Maps agent types to their corresponding classes for dynamic instantiation.
 */
import { AgentType } from '../interfaces/agent.interface';
import { ContentCreatorAgent } from './content-creator.agent';
import { StrategyAgent } from './strategy.agent';
import { EngagementAgent } from './engagement.agent';
import { AnalyticsAgent } from './analytics.agent';
import { TrendDetectionAgent } from './trend-detection.agent';
import { CompetitorAnalysisAgent } from './competitor-analysis.agent';

export const AGENT_REGISTRY = {
  [AgentType.CONTENT_CREATOR]: ContentCreatorAgent,
  [AgentType.STRATEGY]: StrategyAgent,
  [AgentType.ENGAGEMENT]: EngagementAgent,
  [AgentType.ANALYTICS]: AnalyticsAgent,
  [AgentType.TREND_DETECTION]: TrendDetectionAgent,
  [AgentType.COMPETITOR_ANALYSIS]: CompetitorAnalysisAgent,
};

/**
 * Get agent class by type
 */
export function getAgentClass(type: AgentType) {
  const AgentClass = AGENT_REGISTRY[type];
  if (!AgentClass) {
    throw new Error(`Unknown agent type: ${type}`);
  }
  return AgentClass;
}

/**
 * Get all available agent types
 */
export function getAvailableAgentTypes(): AgentType[] {
  return Object.keys(AGENT_REGISTRY) as AgentType[];
}

/**
 * Check if agent type is valid
 */
export function isValidAgentType(type: string): type is AgentType {
  return type in AGENT_REGISTRY;
}
