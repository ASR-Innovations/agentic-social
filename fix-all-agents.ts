/**
 * Comprehensive fix for all agent TypeScript errors
 * 
 * This file documents all the fixes needed:
 * 
 * 1. All agents need to add config parameter to their private methods
 * 2. All metadata objects need duration, model, provider fields
 * 3. All agents need to implement execute() and capabilities abstract methods
 * 4. Constructor needs to match BaseAgent signature (id, type, config, providerFactory)
 */

// Fix 1: Add config parameter to all private methods in engagement.agent.ts
// Change: private async generateResponse(task: AgentTask): Promise<AgentResult>
// To: private async generateResponse(task: AgentTask, config: AgentConfig): Promise<AgentResult>

// Fix 2: Add missing metadata fields everywhere
// Change: metadata: { tokensUsed, cost, ... }
// To: metadata: { tokensUsed, cost, duration, model: config.model, provider: config.aiProvider, ... }

// Fix 3: Implement abstract methods in all agents
// Add to each agent class:
// - get capabilities(): AgentCapability[] { return [...]; }
// - async execute(task: AgentTask): Promise<AgentResult> { ... }

// Fix 4: Fix constructor to match BaseAgent
// Change: super(configRepository, providerFactory, memoryService)
// To: super(id, type, config, providerFactory)

export const FIXES_NEEDED = {
  'analytics.agent.ts': [
    'Add execute() method',
    'Add capabilities getter',
    'Fix constructor',
    'Add duration, model, provider to all metadata objects',
  ],
  'competitor-analysis.agent.ts': [
    'Add execute() method',
    'Add capabilities getter',
    'Fix constructor',
    'Add duration, model, provider to all metadata objects',
  ],
  'engagement.agent.ts': [
    'Add config parameter to all private methods',
    'Fix all config references',
    'Add duration, model, provider to all metadata objects',
  ],
  'strategy.agent.ts': [
    'Add execute() method',
    'Add capabilities getter',
    'Fix constructor',
    'Add duration, model, provider to all metadata objects',
  ],
  'trend-detection.agent.ts': [
    'Add execute() method',
    'Add capabilities getter',
    'Fix constructor',
    'Add duration, model, provider to all metadata objects',
  ],
};
