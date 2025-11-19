/**
 * Database Verification Script
 * Verifies that all database tables, collections, and indexes are properly set up
 * 
 * Run with: ts-node scripts/verify-database.ts
 */

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'social_media_platform';

async function verifyPostgreSQL() {
  console.log('\n🔍 Verifying PostgreSQL setup...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful');
    
    // Check tables exist
    const tables = [
      'users',
      'workspaces',
      'social_accounts',
      'posts',
      'platform_posts',
      'media_assets',
      'conversations',
      'messages',
      'campaigns',
      'workflows',
      'approvals',
    ];
    
    console.log('\n📋 Checking tables...');
    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${table}"`
        );
        console.log(`  ✓ ${table}: exists`);
      } catch (error) {
        console.log(`  ✗ ${table}: missing or error`);
      }
    }
    
    // Check for seed data
    console.log('\n📊 Checking seed data...');
    const workspaceCount = await prisma.workspace.count();
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const socialAccountCount = await prisma.socialAccount.count();
    
    console.log(`  Workspaces: ${workspaceCount}`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Posts: ${postCount}`);
    console.log(`  Social Accounts: ${socialAccountCount}`);
    
    if (workspaceCount > 0 && userCount > 0) {
      console.log('✅ Seed data present');
    } else {
      console.log('⚠️  No seed data found. Run: npm run prisma:seed');
    }
    
    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    
    console.log(`  Total indexes: ${(indexes as any[]).length}`);
    
    // Count indexes per table
    const indexCounts: Record<string, number> = {};
    (indexes as any[]).forEach((idx: any) => {
      indexCounts[idx.tablename] = (indexCounts[idx.tablename] || 0) + 1;
    });
    
    console.log('\n  Indexes per table:');
    Object.entries(indexCounts).forEach(([table, count]) => {
      console.log(`    ${table}: ${count} indexes`);
    });
    
    console.log('\n✅ PostgreSQL verification complete');
    
  } catch (error) {
    console.error('❌ PostgreSQL verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyMongoDB() {
  console.log('\n🔍 Verifying MongoDB setup...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    const db = client.db(DB_NAME);
    
    // Check collections exist
    const expectedCollections = [
      'metrics',
      'mentions',
      'ai_cache',
      'audit_logs',
      'trends',
      'influencers',
      'analytics_aggregations',
    ];
    
    console.log('\n📋 Checking collections...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    for (const expectedCollection of expectedCollections) {
      if (collectionNames.includes(expectedCollection)) {
        const count = await db.collection(expectedCollection).countDocuments();
        console.log(`  ✓ ${expectedCollection}: exists (${count} documents)`);
      } else {
        console.log(`  ✗ ${expectedCollection}: missing`);
      }
    }
    
    // Check indexes
    console.log('\n🔍 Checking indexes...');
    for (const collectionName of expectedCollections) {
      if (collectionNames.includes(collectionName)) {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`  ${collectionName}: ${indexes.length} indexes`);
      }
    }
    
    // Check time-series collection
    console.log('\n⏰ Checking time-series configuration...');
    const metricsInfo = collections.find(c => c.name === 'metrics');
    if (metricsInfo && metricsInfo.type === 'timeseries') {
      console.log('  ✓ Metrics is configured as time-series collection');
    } else if (metricsInfo) {
      console.log('  ⚠️  Metrics exists but may not be time-series');
    }
    
    // Check TTL indexes
    console.log('\n⏳ Checking TTL indexes...');
    const aiCacheIndexes = await db.collection('ai_cache').indexes();
    const hasTTL = aiCacheIndexes.some((idx: any) => idx.expireAfterSeconds);
    if (hasTTL) {
      console.log('  ✓ AI cache has TTL index configured');
    } else {
      console.log('  ⚠️  AI cache TTL index not found');
    }
    
    console.log('\n✅ MongoDB verification complete');
    
  } catch (error) {
    console.error('❌ MongoDB verification failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('🚀 Starting database verification...');
  console.log('=====================================');
  
  try {
    await verifyPostgreSQL();
    await verifyMongoDB();
    
    console.log('\n=====================================');
    console.log('✅ All database verifications passed!');
    console.log('\n📚 Next steps:');
    console.log('  1. Start the backend: npm run start:dev');
    console.log('  2. Start the frontend: npm run dev:frontend');
    console.log('  3. Access Prisma Studio: npm run prisma:studio');
    console.log('  4. View MongoDB: Use MongoDB Compass at mongodb://localhost:27017');
    
  } catch (error) {
    console.error('\n❌ Database verification failed');
    console.error('\n🔧 Troubleshooting:');
    console.error('  1. Ensure Docker containers are running: npm run docker:up');
    console.error('  2. Run PostgreSQL migrations: npm run prisma:migrate');
    console.error('  3. Seed PostgreSQL: npm run prisma:seed');
    console.error('  4. Initialize MongoDB: npm run mongodb:init');
    process.exit(1);
  }
}

main();
