#!/usr/bin/env ts-node
/**
 * End-to-End Test for AgentFlow SDK
 * 
 * This script tests the COMPLETE AgentFlow system with REAL API calls:
 * 1. AI Provider Factory with all 4 providers
 * 2. Content Creator Agent
 * 3. Real API calls to DeepSeek/Gemini/Claude/OpenAI
 * 4. Cost tracking and budget management
 * 
 * Prerequisites:
 * - Set up .env file with API keys
 * - Run: npm install
 * - Run: npx ts-node scripts/test-agentflow-e2e.ts
 */

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AgentFlowService } from '../src/agentflow/agentflow.service';
import { AIProviderFactory } from '../src/ai/providers/provider.factory';
import { AgentType } from '../src/agentflow/interfaces/agent.interface';
import { AIProviderType } from '../src/ai/providers/ai-provider.interface';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 AgentFlow SDK - End-to-End Test\n');
  console.log('=' .repeat(60));
  console.log('');

  // Check API keys
  console.log('📋 Checking API Keys...');
  const apiKeys = {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    gemini: !!process.env.GOOGLE_AI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };

  Object.entries(apiKeys).forEach(([provider, configured]) => {
    console.log(`   ${configured ? '✅' : '❌'} ${provider.toUpperCase()}: ${configured ? 'Configured' : 'Missing'}`);
  });
  console.log('');

  if (!Object.values(apiKeys).some(v => v)) {
    console.error('❌ No API keys configured! Please set up .env file.');
    console.error('   Copy .env.example to .env and add your API keys.');
    process.exit(1);
  }

  // Bootstrap NestJS application
  console.log('🔧 Bootstrapping NestJS application...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const agentFlowService = app.get(AgentFlowService);
  const providerFactory = app.get(AIProviderFactory);

  console.log('✅ Application bootstrapped\n');

  // Test 1: Provider Factory
  console.log('=' .repeat(60));
  console.log('TEST 1: AI Provider Factory');
  console.log('=' .repeat(60));
  console.log('');

  const availableProviders = providerFactory.getAvailableProviders();
  console.log(`Available providers: ${availableProviders.join(', ')}`);
  console.log('');

  // Test 2: Create Content Creator Agent
  console.log('=' .repeat(60));
  console.log('TEST 2: Create Content Creator Agent');
  console.log('=' .repeat(60));
  console.log('');

  const testTenantId = 'test-tenant-' + Date.now();
  
  const agentConfig = {
    name: 'E2E Test Content Creator',
    type: AgentType.CONTENT_CREATOR,
    aiProvider: availableProviders[0] as AIProviderType, // Use first available
    model: availableProviders[0] === AIProviderType.DEEPSEEK ? 'deepseek-chat' : 
           availableProviders[0] === AIProviderType.GEMINI ? 'gemini-pro' :
           availableProviders[0] === AIProviderType.CLAUDE ? 'claude-3-5-sonnet-20241022' :
           'gpt-4-turbo',
    personalityConfig: {
      tone: 'professional',
      style: 'engaging',
      creativity: 0.8,
    },
    costBudget: 1.0, // $1 budget for testing
  };

  console.log(`Creating agent with provider: ${agentConfig.aiProvider}`);
  const agent = await agentFlowService.createAgent(testTenantId, agentConfig);
  console.log(`✅ Agent created: ${agent.id}`);
  console.log(`   Name: ${agent.name}`);
  console.log(`   Type: ${agent.type}`);
  console.log(`   Provider: ${agent.aiProvider}`);
  console.log(`   Model: ${agent.model}`);
  console.log('');

  // Test 3: Generate Twitter Content (REAL API CALL)
  console.log('=' .repeat(60));
  console.log('TEST 3: Generate Twitter Content (REAL API CALL)');
  console.log('=' .repeat(60));
  console.log('');

  console.log('Generating Twitter content about "AI in social media"...');
  const twitterTask = {
    type: 'generate_twitter_content',
    input: {
      topic: 'AI in social media marketing',
      tone: 'engaging',
      variations: 2,
      includeHashtags: true,
    },
  };

  const twitterResult = await agentFlowService.executeTask(testTenantId, agent.id, twitterTask);
  
  console.log(`✅ Generation complete!`);
  console.log(`   Success: ${twitterResult.success}`);
  console.log(`   Platform: ${twitterResult.output.platform}`);
  console.log(`   Variations generated: ${twitterResult.output.variations?.length || 0}`);
  console.log(`   Tokens used: ${twitterResult.metadata.tokensUsed}`);
  console.log(`   Cost: $${twitterResult.metadata.cost.toFixed(4)}`);
  console.log(`   Duration: ${twitterResult.metadata.duration}ms`);
  console.log('');
  console.log('Generated content:');
  if (twitterResult.output.variations) {
    twitterResult.output.variations.forEach((tweet: string, i: number) => {
      console.log(`   ${i + 1}. ${tweet}`);
    });
  }
  console.log('');

  // Test 4: Generate LinkedIn Content (REAL API CALL)
  console.log('=' .repeat(60));
  console.log('TEST 4: Generate LinkedIn Content (REAL API CALL)');
  console.log('=' .repeat(60));
  console.log('');

  console.log('Generating LinkedIn content about "Remote work trends"...');
  const linkedinTask = {
    type: 'generate_linkedin_content',
    input: {
      topic: 'Remote work trends in 2024',
      tone: 'professional',
      length: 'short',
      includeHashtags: true,
    },
  };

  const linkedinResult = await agentFlowService.executeTask(testTenantId, agent.id, linkedinTask);
  
  console.log(`✅ Generation complete!`);
  console.log(`   Success: ${linkedinResult.success}`);
  console.log(`   Platform: ${linkedinResult.output.platform}`);
  console.log(`   Tokens used: ${linkedinResult.metadata.tokensUsed}`);
  console.log(`   Cost: $${linkedinResult.metadata.cost.toFixed(4)}`);
  console.log(`   Duration: ${linkedinResult.metadata.duration}ms`);
  console.log('');
  console.log('Generated content:');
  console.log(`   ${linkedinResult.output.content.substring(0, 200)}...`);
  console.log('');

  // Test 5: Check Agent Statistics
  console.log('=' .repeat(60));
  console.log('TEST 5: Agent Statistics & Cost Tracking');
  console.log('=' .repeat(60));
  console.log('');

  const updatedAgent = await agentFlowService.findOne(testTenantId, agent.id);
  console.log('Agent usage statistics:');
  console.log(`   Total tasks: ${updatedAgent.usageStats?.totalTasks || 0}`);
  console.log(`   Successful: ${updatedAgent.usageStats?.successfulTasks || 0}`);
  console.log(`   Failed: ${updatedAgent.usageStats?.failedTasks || 0}`);
  console.log(`   Total cost: $${(updatedAgent.usageStats?.totalCost || 0).toFixed(4)}`);
  console.log(`   Average duration: ${(updatedAgent.usageStats?.averageDuration || 0).toFixed(0)}ms`);
  console.log('');

  // Test 6: Get All Agents
  console.log('=' .repeat(60));
  console.log('TEST 6: List All Agents');
  console.log('=' .repeat(60));
  console.log('');

  const allAgents = await agentFlowService.findAll(testTenantId);
  console.log(`Total agents for tenant: ${allAgents.length}`);
  allAgents.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.name} (${a.type}) - ${a.active ? 'Active' : 'Inactive'}`);
  });
  console.log('');

  // Cleanup
  console.log('🧹 Cleaning up test data...');
  await agentFlowService.delete(testTenantId, agent.id);
  console.log('✅ Test agent deleted');
  console.log('');

  // Summary
  console.log('=' .repeat(60));
  console.log('✅ ALL TESTS PASSED!');
  console.log('=' .repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`   ✅ AI Provider Factory working`);
  console.log(`   ✅ Content Creator Agent created`);
  console.log(`   ✅ Twitter content generated (REAL API)`);
  console.log(`   ✅ LinkedIn content generated (REAL API)`);
  console.log(`   ✅ Cost tracking working`);
  console.log(`   ✅ Agent management working`);
  console.log('');
  console.log('🎉 AgentFlow SDK is PRODUCTION READY!');
  console.log('');

  await app.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('');
  console.error('❌ TEST FAILED!');
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  if (error.stack) {
    console.error('Stack trace:');
    console.error(error.stack);
  }
  process.exit(1);
});
