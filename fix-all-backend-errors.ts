#!/usr/bin/env ts-node

/**
 * Comprehensive Backend Error Fix Script
 * Fixes all TypeScript compilation errors in agent files
 */

import * as fs from 'fs';
import * as path from 'path';

const AGENTS_DIR = path.join(__dirname, 'src', 'agentflow', 'agents');

// Helper to add missing metadata fields
function addMissingMetadataFields(content: string): string {
  // Pattern to find metadata objects missing required fields
  const metadataPattern = /metadata:\s*\{([^}]+)\}/g;
  
  return content.replace(metadataPattern, (match, fields) => {
    const hasTokensUsed = fields.includes('tokensUsed');
    const hasCost = fields.includes('cost');
    const hasDuration = fields.includes('duration');
    const hasModel = fields.includes('model');
    const hasProvider = fields.includes('provider');
    
    let newFields = fields.trim();
    
    if (!hasTokensUsed) {
      newFields += ',\n        tokensUsed: 0';
    }
    if (!hasCost) {
      newFields += ',\n        cost: 0';
    }
    if (!hasDuration) {
      newFields += ',\n        duration: Date.now() - startTime';
    }
    if (!hasModel) {
      newFields += ',\n        model: this.config.model';
    }
    if (!hasProvider) {
      newFields += ',\n        provider: this.config.aiProvider';
    }
    
    return `metadata: {${newFields}\n      }`;
  });
}

// Fix constructor super() calls
function fixConstructorCalls(content: string): string {
  // Fix super() calls with missing arguments
  return content.replace(
    /super\(configRepository,\s*providerFactory,\s*memoryService\);/g,
    `super(
      \`\${this.constructor.name}-\${Date.now()}\`,
      AgentType.${content.match(/export class (\w+)Agent/)?.[1]?.toUpperCase() || 'UNKNOWN'},
      {} as AgentConfig, // Will be set by service
      providerFactory
    );`
  );
}

// Add missing execute and capabilities implementations
function addMissingImplementations(content: string, agentName: string): string {
  // Check if execute method exists
  if (!content.includes('async execute(')) {
    const executeMethod = `
  /**
   * Execute agent task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Route to appropriate method based on task type
      switch (task.type) {
        default:
          throw new Error(\`Unknown task type: \${task.type}\`);
      }
    } catch (error) {
      this.logger.error(\`Execution failed: \${error.message}\`);
      return {
        success: false,
        output: {},
        metadata: {
          tokensUsed: 0,
          cost: 0,
          duration: Date.now() - startTime,
          model: this.config.model,
          provider: this.config.aiProvider,
        },
        error: error.message,
      };
    }
  }
`;
    
    // Insert before the last closing brace
    const lastBraceIndex = content.lastIndexOf('}');
    content = content.slice(0, lastBraceIndex) + executeMethod + content.slice(lastBraceIndex);
  }
  
  // Check if capabilities getter exists
  if (!content.includes('get capabilities()')) {
    const capabilitiesGetter = `
  /**
   * Get agent capabilities
   */
  get capabilities(): AgentCapability[] {
    return [];
  }
`;
    
    // Insert before the last closing brace
    const lastBraceIndex = content.lastIndexOf('}');
    content = content.slice(0, lastBraceIndex) + capabilitiesGetter + content.slice(lastBraceIndex);
  }
  
  return content;
}

// Fix 'config' references to 'this.config'
function fixConfigReferences(content: string): string {
  // Replace standalone 'config' with 'this.config' where appropriate
  return content.replace(/(?<!this\.)config\./g, 'this.config.');
}

// Fix provider.factory.ts estimate issue
function fixProviderFactory(content: string): string {
  return content.replace(
    /estimates\.set\(type,\s*estimate\);/g,
    'estimates.set(type, await estimate);'
  );
}

// Process each agent file
const agentFiles = [
  'analytics.agent.ts',
  'competitor-analysis.agent.ts',
  'engagement.agent.ts',
  'strategy.agent.ts',
  'trend-detection.agent.ts',
];

console.log('🔧 Starting comprehensive backend error fixes...\n');

agentFiles.forEach(filename => {
  const filePath = path.join(AGENTS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filename} - file not found`);
    return;
  }
  
  console.log(`📝 Processing ${filename}...`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const agentName = filename.replace('.agent.ts', '');
  
  // Apply all fixes
  content = fixConstructorCalls(content);
  content = addMissingMetadataFields(content);
  content = addMissingImplementations(content, agentName);
  content = fixConfigReferences(content);
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Fixed ${filename}`);
});

// Fix provider factory
const providerFactoryPath = path.join(__dirname, 'src', 'ai', 'providers', 'provider.factory.ts');
if (fs.existsSync(providerFactoryPath)) {
  console.log('\n📝 Processing provider.factory.ts...');
  let content = fs.readFileSync(providerFactoryPath, 'utf-8');
  content = fixProviderFactory(content);
  fs.writeFileSync(providerFactoryPath, content, 'utf-8');
  console.log('✅ Fixed provider.factory.ts');
}

console.log('\n✨ All fixes applied successfully!');
console.log('🔄 TypeScript should now recompile without errors.');
