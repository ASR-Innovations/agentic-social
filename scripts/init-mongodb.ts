/**
 * MongoDB Initialization Script (TypeScript/Node.js version)
 * Creates collections and indexes for analytics, mentions, AI cache, and audit logs
 * 
 * Run with: ts-node scripts/init-mongodb.ts
 * Or: npm run mongodb:init
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'social_media_platform';

async function initializeMongoDB() {
  console.log('🚀 Connecting to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // ============================================
    // Metrics Collection (Time-series data)
    // ============================================
    console.log('\n📊 Creating metrics collection...');
    
    try {
      await db.collection('metrics').drop();
    } catch (e) {
      // Collection doesn't exist, that's fine
    }
    
    await db.createCollection('metrics', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'hours',
      },
      expireAfterSeconds: 31536000, // 1 year retention
    });
    
    const metricsCollection = db.collection('metrics');
    await metricsCollection.createIndex({ 'metadata.workspaceId': 1, timestamp: -1 });
    await metricsCollection.createIndex({ 'metadata.accountId': 1, timestamp: -1 });
    await metricsCollection.createIndex({ 'metadata.postId': 1, timestamp: -1 });
    await metricsCollection.createIndex({ 'metadata.platform': 1, timestamp: -1 });
    await metricsCollection.createIndex({ 'metadata.metricType': 1, timestamp: -1 });
    
    console.log('✅ Metrics collection created with indexes');
    
    // Insert sample data
    await metricsCollection.insertMany([
      {
        timestamp: new Date(),
        metadata: {
          workspaceId: 'sample-workspace-id',
          accountId: 'sample-account-id',
          postId: 'sample-post-id',
          platform: 'instagram',
          metricType: 'engagement',
        },
        likes: 245,
        comments: 32,
        shares: 18,
        saves: 67,
        reach: 5420,
        impressions: 8932,
      },
      {
        timestamp: new Date(Date.now() - 3600000),
        metadata: {
          workspaceId: 'sample-workspace-id',
          accountId: 'sample-account-id',
          platform: 'instagram',
          metricType: 'account',
        },
        followers: 15420,
        following: 892,
        posts: 234,
        avgEngagementRate: 4.2,
      },
    ]);
    
    // ============================================
    // Mentions Collection (Social Listening)
    // ============================================
    console.log('\n👂 Creating mentions collection...');
    
    try {
      await db.collection('mentions').drop();
    } catch (e) {
      // Collection doesn't exist
    }
    
    const mentionsCollection = db.collection('mentions');
    await mentionsCollection.createIndex({ workspaceId: 1, createdAt: -1 });
    await mentionsCollection.createIndex({ workspaceId: 1, platform: 1, createdAt: -1 });
    await mentionsCollection.createIndex({ workspaceId: 1, sentiment: 1 });
    await mentionsCollection.createIndex({ queryId: 1, createdAt: -1 });
    await mentionsCollection.createIndex({ 'author.username': 1 });
    await mentionsCollection.createIndex({ isInfluencer: 1 });
    await mentionsCollection.createIndex({ tags: 1 });
    await mentionsCollection.createIndex({ language: 1 });
    await mentionsCollection.createIndex({ content: 'text', 'author.name': 'text' });
    
    console.log('✅ Mentions collection created with indexes');
    
    await mentionsCollection.insertMany([
      {
        workspaceId: 'sample-workspace-id',
        queryId: 'query-123',
        platform: 'twitter',
        author: {
          id: 'user_123',
          username: 'tech_enthusiast',
          name: 'Tech Enthusiast',
          avatar: 'https://example.com/avatar.jpg',
          followers: 5420,
        },
        content: 'Just tried @demo_agency new product and I\'m impressed! Great quality and fast shipping. #ProductReview',
        url: 'https://twitter.com/tech_enthusiast/status/123456789',
        sentiment: 'positive',
        sentimentScore: 0.85,
        reach: 5420,
        engagement: 234,
        language: 'en',
        location: 'New York, USA',
        isInfluencer: false,
        tags: ['product-review', 'positive-feedback'],
        createdAt: new Date(),
        fetchedAt: new Date(),
      },
      {
        workspaceId: 'sample-workspace-id',
        queryId: 'query-123',
        platform: 'instagram',
        author: {
          id: 'user_456',
          username: 'lifestyle_blogger',
          name: 'Lifestyle Blogger',
          avatar: 'https://example.com/avatar2.jpg',
          followers: 45230,
        },
        content: 'Loving the new collection from @demo_agency! 😍 Perfect for summer vibes. #SummerFashion #OOTD',
        url: 'https://instagram.com/p/ABC123',
        sentiment: 'positive',
        sentimentScore: 0.92,
        reach: 45230,
        engagement: 1823,
        language: 'en',
        isInfluencer: true,
        tags: ['influencer', 'product-mention'],
        createdAt: new Date(Date.now() - 7200000),
        fetchedAt: new Date(),
      },
    ]);
    
    // ============================================
    // AI Cache Collection
    // ============================================
    console.log('\n🤖 Creating ai_cache collection...');
    
    try {
      await db.collection('ai_cache').drop();
    } catch (e) {
      // Collection doesn't exist
    }
    
    const aiCacheCollection = db.collection('ai_cache');
    await aiCacheCollection.createIndex({ cacheKey: 1 }, { unique: true });
    await aiCacheCollection.createIndex({ workspaceId: 1 });
    await aiCacheCollection.createIndex({ agentType: 1 });
    await aiCacheCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
    
    console.log('✅ AI cache collection created with indexes');
    
    await aiCacheCollection.insertMany([
      {
        cacheKey: 'content_gen_summer_product_launch_instagram',
        workspaceId: 'sample-workspace-id',
        agentType: 'content_creator',
        prompt: 'Generate Instagram post for summer product launch',
        response: {
          variations: [
            {
              text: '☀️ Summer is here and so is our new collection! Discover fresh styles perfect for sunny days. Shop now! #SummerCollection #NewArrivals',
              hashtags: ['SummerCollection', 'NewArrivals', 'Fashion', 'SummerVibes'],
              tone: 'enthusiastic',
            },
            {
              text: 'Introducing our summer essentials 🌴 Lightweight, stylish, and perfect for the season. Limited stock available! #SummerFashion',
              hashtags: ['SummerFashion', 'Essentials', 'LimitedEdition'],
              tone: 'casual',
            },
          ],
        },
        model: 'gpt-4o-mini',
        cost: 0.0023,
        createdAt: new Date(),
      },
      {
        cacheKey: 'hashtag_analysis_fashion_summer',
        workspaceId: 'sample-workspace-id',
        agentType: 'hashtag_intelligence',
        prompt: 'Analyze hashtags for fashion summer content',
        response: {
          hashtags: [
            { tag: 'SummerFashion', reach: 'high', competition: 'high', relevance: 0.95 },
            { tag: 'SummerStyle', reach: 'high', competition: 'medium', relevance: 0.88 },
            { tag: 'SummerVibes', reach: 'medium', competition: 'medium', relevance: 0.82 },
            { tag: 'OOTD', reach: 'high', competition: 'high', relevance: 0.75 },
          ],
        },
        model: 'gpt-4o-mini',
        cost: 0.0018,
        createdAt: new Date(Date.now() - 3600000),
      },
    ]);
    
    // ============================================
    // Audit Logs Collection
    // ============================================
    console.log('\n📝 Creating audit_logs collection...');
    
    try {
      await db.collection('audit_logs').drop();
    } catch (e) {
      // Collection doesn't exist
    }
    
    const auditLogsCollection = db.collection('audit_logs');
    await auditLogsCollection.createIndex({ workspaceId: 1, timestamp: -1 });
    await auditLogsCollection.createIndex({ userId: 1, timestamp: -1 });
    await auditLogsCollection.createIndex({ action: 1, timestamp: -1 });
    await auditLogsCollection.createIndex({ resourceType: 1, resourceId: 1 });
    await auditLogsCollection.createIndex({ timestamp: -1 });
    
    console.log('✅ Audit logs collection created with indexes');
    
    await auditLogsCollection.insertMany([
      {
        workspaceId: 'sample-workspace-id',
        userId: 'user-123',
        userName: 'John Owner',
        userEmail: 'owner@demo.com',
        action: 'post.create',
        resourceType: 'post',
        resourceId: 'post-123',
        details: {
          postContent: 'Summer product launch announcement',
          platforms: ['instagram', 'twitter'],
          status: 'scheduled',
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(),
      },
      {
        workspaceId: 'sample-workspace-id',
        userId: 'user-456',
        userName: 'Emma Editor',
        userEmail: 'editor@demo.com',
        action: 'post.publish',
        resourceType: 'post',
        resourceId: 'post-456',
        details: {
          platforms: ['instagram'],
          publishedAt: new Date(),
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 1800000),
      },
    ]);
    
    // ============================================
    // Additional Collections
    // ============================================
    console.log('\n📈 Creating additional collections...');
    
    // Trends
    try {
      await db.collection('trends').drop();
    } catch (e) {}
    const trendsCollection = db.collection('trends');
    await trendsCollection.createIndex({ workspaceId: 1, detectedAt: -1 });
    await trendsCollection.createIndex({ platform: 1, detectedAt: -1 });
    await trendsCollection.createIndex({ trendType: 1 });
    await trendsCollection.createIndex({ growthVelocity: -1 });
    
    // Influencers
    try {
      await db.collection('influencers').drop();
    } catch (e) {}
    const influencersCollection = db.collection('influencers');
    await influencersCollection.createIndex({ workspaceId: 1 });
    await influencersCollection.createIndex({ platform: 1, username: 1 });
    await influencersCollection.createIndex({ 'metrics.followers': -1 });
    await influencersCollection.createIndex({ 'metrics.engagementRate': -1 });
    await influencersCollection.createIndex({ authenticityScore: -1 });
    await influencersCollection.createIndex({ tags: 1 });
    
    // Analytics Aggregations
    try {
      await db.collection('analytics_aggregations').drop();
    } catch (e) {}
    const analyticsAggCollection = db.collection('analytics_aggregations');
    await analyticsAggCollection.createIndex({ workspaceId: 1, date: -1, granularity: 1 });
    await analyticsAggCollection.createIndex({ accountId: 1, date: -1 });
    await analyticsAggCollection.createIndex({ platform: 1, date: -1 });
    
    console.log('✅ Additional collections created');
    
    console.log('\n✅ MongoDB initialization completed successfully!');
    console.log('\n📊 Collections created:');
    console.log('  ✓ metrics (time-series, 1 year retention)');
    console.log('  ✓ mentions (with full-text search)');
    console.log('  ✓ ai_cache (24 hour TTL)');
    console.log('  ✓ audit_logs');
    console.log('  ✓ trends');
    console.log('  ✓ influencers');
    console.log('  ✓ analytics_aggregations');
    console.log('\n🔍 Sample data inserted for development');
    
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the initialization
initializeMongoDB();
