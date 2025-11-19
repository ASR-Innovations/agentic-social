/**
 * MongoDB Initialization Script
 * Creates collections and indexes for analytics, mentions, AI cache, and audit logs
 * 
 * Run with: node scripts/init-mongodb.js
 * Or via Docker: docker-compose exec mongodb mongosh < scripts/init-mongodb.js
 */

// Connect to the database
const db = db.getSiblingDB('social_media_platform');

console.log('🚀 Initializing MongoDB collections...');

// ============================================
// Metrics Collection (Time-series data)
// ============================================
console.log('📊 Creating metrics collection...');

// Drop if exists (for development)
db.metrics.drop();

// Create time-series collection for metrics
db.createCollection('metrics', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'hours',
  },
  expireAfterSeconds: 31536000, // 1 year retention
});

// Create indexes for metrics
db.metrics.createIndex({ 'metadata.workspaceId': 1, timestamp: -1 });
db.metrics.createIndex({ 'metadata.accountId': 1, timestamp: -1 });
db.metrics.createIndex({ 'metadata.postId': 1, timestamp: -1 });
db.metrics.createIndex({ 'metadata.platform': 1, timestamp: -1 });
db.metrics.createIndex({ 'metadata.metricType': 1, timestamp: -1 });

console.log('✅ Metrics collection created with indexes');

// Insert sample metrics data
db.metrics.insertMany([
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
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
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
console.log('👂 Creating mentions collection...');

db.mentions.drop();
db.createCollection('mentions');

// Create indexes for mentions
db.mentions.createIndex({ workspaceId: 1, createdAt: -1 });
db.mentions.createIndex({ workspaceId: 1, platform: 1, createdAt: -1 });
db.mentions.createIndex({ workspaceId: 1, sentiment: 1 });
db.mentions.createIndex({ queryId: 1, createdAt: -1 });
db.mentions.createIndex({ 'author.username': 1 });
db.mentions.createIndex({ isInfluencer: 1 });
db.mentions.createIndex({ tags: 1 });
db.mentions.createIndex({ language: 1 });

// Text index for full-text search
db.mentions.createIndex({ content: 'text', 'author.name': 'text' });

console.log('✅ Mentions collection created with indexes');

// Insert sample mentions
db.mentions.insertMany([
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
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    fetchedAt: new Date(),
  },
]);

// ============================================
// AI Cache Collection
// ============================================
console.log('🤖 Creating ai_cache collection...');

db.ai_cache.drop();
db.createCollection('ai_cache');

// Create indexes for AI cache
db.ai_cache.createIndex({ cacheKey: 1 }, { unique: true });
db.ai_cache.createIndex({ workspaceId: 1 });
db.ai_cache.createIndex({ agentType: 1 });
db.ai_cache.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hour TTL

console.log('✅ AI cache collection created with indexes');

// Insert sample cache entries
db.ai_cache.insertMany([
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
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
]);

// ============================================
// Audit Logs Collection
// ============================================
console.log('📝 Creating audit_logs collection...');

db.audit_logs.drop();
db.createCollection('audit_logs');

// Create indexes for audit logs
db.audit_logs.createIndex({ workspaceId: 1, timestamp: -1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.audit_logs.createIndex({ action: 1, timestamp: -1 });
db.audit_logs.createIndex({ resourceType: 1, resourceId: 1 });
db.audit_logs.createIndex({ timestamp: -1 });

// Capped collection for log rotation (optional - limits size)
// db.createCollection('audit_logs', { capped: true, size: 10737418240, max: 10000000 }); // 10GB, 10M docs

console.log('✅ Audit logs collection created with indexes');

// Insert sample audit logs
db.audit_logs.insertMany([
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
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
  },
  {
    workspaceId: 'sample-workspace-id',
    userId: 'user-123',
    userName: 'John Owner',
    userEmail: 'owner@demo.com',
    action: 'user.invite',
    resourceType: 'user',
    resourceId: 'user-789',
    details: {
      invitedEmail: 'newuser@demo.com',
      role: 'EDITOR',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    workspaceId: 'sample-workspace-id',
    userId: 'user-456',
    userName: 'Emma Editor',
    userEmail: 'editor@demo.com',
    action: 'conversation.reply',
    resourceType: 'conversation',
    resourceId: 'conv-123',
    details: {
      platform: 'instagram',
      replyContent: 'Thank you for your feedback!',
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
  },
]);

// ============================================
// Additional Collections for Future Use
// ============================================

// Trends Collection
console.log('📈 Creating trends collection...');
db.trends.drop();
db.createCollection('trends');
db.trends.createIndex({ workspaceId: 1, detectedAt: -1 });
db.trends.createIndex({ platform: 1, detectedAt: -1 });
db.trends.createIndex({ trendType: 1 });
db.trends.createIndex({ growthVelocity: -1 });
console.log('✅ Trends collection created');

// Influencers Collection
console.log('👥 Creating influencers collection...');
db.influencers.drop();
db.createCollection('influencers');
db.influencers.createIndex({ workspaceId: 1 });
db.influencers.createIndex({ platform: 1, username: 1 });
db.influencers.createIndex({ 'metrics.followers': -1 });
db.influencers.createIndex({ 'metrics.engagementRate': -1 });
db.influencers.createIndex({ authenticityScore: -1 });
db.influencers.createIndex({ tags: 1 });
console.log('✅ Influencers collection created');

// Analytics Aggregations Collection
console.log('📊 Creating analytics_aggregations collection...');
db.analytics_aggregations.drop();
db.createCollection('analytics_aggregations');
db.analytics_aggregations.createIndex({ workspaceId: 1, date: -1, granularity: 1 });
db.analytics_aggregations.createIndex({ accountId: 1, date: -1 });
db.analytics_aggregations.createIndex({ platform: 1, date: -1 });
console.log('✅ Analytics aggregations collection created');

console.log('\n✅ MongoDB initialization completed successfully!');
console.log('\n📊 Collections created:');
console.log('  - metrics (time-series, 1 year retention)');
console.log('  - mentions (with full-text search)');
console.log('  - ai_cache (24 hour TTL)');
console.log('  - audit_logs');
console.log('  - trends');
console.log('  - influencers');
console.log('  - analytics_aggregations');
console.log('\n🔍 Sample data inserted for development');
