#!/usr/bin/env ts-node

/**
 * MVP Readiness Verification Script
 * 
 * This script checks if all required components are configured
 * and ready for testing the MVP flow:
 * 1. User Registration
 * 2. Twitter OAuth
 * 3. AI Content Generation
 * 4. Post to Twitter
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  required: boolean;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, required = true): void {
  results.push({
    name,
    status: condition ? 'pass' : (required ? 'fail' : 'warn'),
    message,
    required,
  });
}

console.log('\n🚀 AI Social Media Platform - MVP Readiness Check\n');
console.log('='.repeat(60));

// 1. Check Environment Files
console.log('\n📄 Checking Environment Files...\n');

const envExists = fs.existsSync(path.join(process.cwd(), '.env'));
check(
  'Backend .env file',
  envExists,
  envExists ? '✅ .env file exists' : '❌ .env file not found. Copy .env.example to .env',
  true
);

const frontendEnvExists = fs.existsSync(path.join(process.cwd(), 'frontend', '.env.local'));
check(
  'Frontend .env.local file',
  frontendEnvExists,
  frontendEnvExists ? '✅ frontend/.env.local exists' : '⚠️  frontend/.env.local not found. Copy frontend/.env.example to frontend/.env.local',
  false
);

// 2. Check Required Environment Variables
console.log('\n🔑 Checking Required Environment Variables...\n');

const requiredEnvVars = [
  { key: 'DATABASE_URL', name: 'PostgreSQL Database' },
  { key: 'JWT_SECRET', name: 'JWT Secret' },
  { key: 'ENCRYPTION_KEY', name: 'Encryption Key' },
];

requiredEnvVars.forEach(({ key, name }) => {
  const value = process.env[key];
  check(
    name,
    !!value && value !== `your-${key.toLowerCase().replace(/_/g, '-')}`,
    value ? `✅ ${name} is configured` : `❌ ${name} is missing or using example value`,
    true
  );
});

// 3. Check AI Provider Keys
console.log('\n🤖 Checking AI Provider Configuration...\n');

const aiProviders = [
  { key: 'OPENAI_API_KEY', name: 'OpenAI' },
  { key: 'ANTHROPIC_API_KEY', name: 'Anthropic' },
  { key: 'GOOGLE_AI_API_KEY', name: 'Google AI' },
  { key: 'DEEPSEEK_API_KEY', name: 'DeepSeek' },
];

const configuredProviders = aiProviders.filter(({ key }) => {
  const value = process.env[key];
  return value && !value.startsWith('your-') && !value.startsWith('sk-...');
});

check(
  'AI Provider',
  configuredProviders.length > 0,
  configuredProviders.length > 0
    ? `✅ ${configuredProviders.length} AI provider(s) configured: ${configuredProviders.map(p => p.name).join(', ')}`
    : '❌ No AI providers configured. Add at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, or DEEPSEEK_API_KEY',
  true
);

// 4. Check Twitter OAuth
console.log('\n🐦 Checking Twitter OAuth Configuration...\n');

const twitterClientId = process.env.TWITTER_CLIENT_ID;
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

check(
  'Twitter Client ID',
  !!twitterClientId && !twitterClientId.startsWith('your-'),
  twitterClientId && !twitterClientId.startsWith('your-')
    ? '✅ Twitter Client ID configured'
    : '❌ Twitter Client ID missing. Get from https://developer.twitter.com',
  true
);

check(
  'Twitter Client Secret',
  !!twitterClientSecret && !twitterClientSecret.startsWith('your-'),
  twitterClientSecret && !twitterClientSecret.startsWith('your-')
    ? '✅ Twitter Client Secret configured'
    : '❌ Twitter Client Secret missing',
  true
);

// 5. Check Optional Services
console.log('\n⚙️  Checking Optional Services...\n');

const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
check(
  'AWS S3 (Media Upload)',
  !!awsAccessKey && !awsAccessKey.startsWith('your-') && !awsAccessKey.startsWith('AKIA...'),
  awsAccessKey && !awsAccessKey.startsWith('your-') && !awsAccessKey.startsWith('AKIA...')
    ? '✅ AWS S3 configured'
    : '⚠️  AWS S3 not configured (optional - can use local storage)',
  false
);

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
check(
  'Redis (Caching)',
  !!redisUrl,
  redisUrl ? '✅ Redis configured' : '⚠️  Redis not configured (optional - can work without it)',
  false
);

// 6. Check Database Connection
console.log('\n💾 Checking Database...\n');

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    check(
      'Database URL Format',
      url.protocol === 'postgresql:' || url.protocol === 'postgres:',
      url.protocol === 'postgresql:' || url.protocol === 'postgres:'
        ? '✅ Database URL format is valid'
        : '❌ Database URL should start with postgresql://',
      true
    );
  } catch (error) {
    check(
      'Database URL Format',
      false,
      '❌ Database URL format is invalid',
      true
    );
  }
}

// 7. Check Node Modules
console.log('\n📦 Checking Dependencies...\n');

const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
check(
  'Backend Dependencies',
  nodeModulesExists,
  nodeModulesExists ? '✅ Backend dependencies installed' : '❌ Run: npm install',
  true
);

const frontendNodeModulesExists = fs.existsSync(path.join(process.cwd(), 'frontend', 'node_modules'));
check(
  'Frontend Dependencies',
  frontendNodeModulesExists,
  frontendNodeModulesExists ? '✅ Frontend dependencies installed' : '❌ Run: cd frontend && npm install',
  true
);

// Print Results
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESULTS SUMMARY\n');

const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail').length;
const warned = results.filter(r => r.status === 'warn').length;

results.forEach(result => {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️ ';
  console.log(`${icon} ${result.name}`);
  console.log(`   ${result.message}\n`);
});

console.log('='.repeat(60));
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Warnings: ${warned}\n`);

// Final Verdict
const criticalFailures = results.filter(r => r.status === 'fail' && r.required);

if (criticalFailures.length === 0) {
  console.log('🎉 SUCCESS! Your platform is ready for MVP testing!\n');
  console.log('Next steps:');
  console.log('1. Start backend:  npm run start:dev');
  console.log('2. Start frontend: cd frontend && npm run dev');
  console.log('3. Open browser:   http://localhost:3000');
  console.log('4. Test the flow:  Register → Connect Twitter → Generate Content → Post\n');
  process.exit(0);
} else {
  console.log('❌ FAILED! Please fix the following critical issues:\n');
  criticalFailures.forEach(failure => {
    console.log(`   • ${failure.name}: ${failure.message}`);
  });
  console.log('\nRefer to QUICK_START_GUIDE.md for detailed setup instructions.\n');
  process.exit(1);
}
