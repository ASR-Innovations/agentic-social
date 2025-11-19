import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.approval.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.postMedia.deleteMany();
    await prisma.platformPost.deleteMany();
    await prisma.post.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.mediaAsset.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.socialAccount.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.workspace.deleteMany();
  }

  // Create demo workspace
  console.log('📦 Creating workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Agency',
      slug: 'demo-agency',
      plan: 'PROFESSIONAL',
      settings: {
        timezone: 'America/New_York',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
      },
      branding: {
        primaryColor: '#3B82F6',
        logo: 'https://via.placeholder.com/200x50?text=Demo+Agency',
      },
      limits: {
        maxUsers: 10,
        maxSocialAccounts: 20,
        maxScheduledPosts: 1000,
        storageGB: 100,
      },
    },
  });

  // Create users with different roles
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@demo.com',
      password: hashedPassword,
      name: 'John Owner',
      role: 'OWNER',
      workspaceId: workspace.id,
      avatar: 'https://i.pravatar.cc/150?img=1',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Sarah Admin',
      role: 'ADMIN',
      workspaceId: workspace.id,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      password: hashedPassword,
      name: 'Mike Manager',
      role: 'MANAGER',
      workspaceId: workspace.id,
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@demo.com',
      password: hashedPassword,
      name: 'Emma Editor',
      role: 'EDITOR',
      workspaceId: workspace.id,
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  });

  // Create user permissions
  console.log('🔐 Creating permissions...');
  await prisma.userPermission.createMany({
    data: [
      // Owner has all permissions
      { userId: owner.id, resource: 'posts', action: 'create' },
      { userId: owner.id, resource: 'posts', action: 'read' },
      { userId: owner.id, resource: 'posts', action: 'update' },
      { userId: owner.id, resource: 'posts', action: 'delete' },
      { userId: owner.id, resource: 'analytics', action: 'read' },
      { userId: owner.id, resource: 'settings', action: 'update' },
      // Editor permissions
      { userId: editor.id, resource: 'posts', action: 'create' },
      { userId: editor.id, resource: 'posts', action: 'read' },
      { userId: editor.id, resource: 'posts', action: 'update' },
      { userId: editor.id, resource: 'analytics', action: 'read' },
    ],
  });

  // Create social accounts
  console.log('📱 Creating social accounts...');
  const instagramAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'INSTAGRAM',
      platformAccountId: 'ig_123456789',
      username: 'demo_agency',
      displayName: 'Demo Agency',
      avatar: 'https://via.placeholder.com/150?text=IG',
      accessToken: 'encrypted_token_instagram',
      refreshToken: 'encrypted_refresh_token_instagram',
      tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      metadata: {
        followersCount: 15420,
        followingCount: 892,
        postsCount: 234,
      },
    },
  });

  const twitterAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'TWITTER',
      platformAccountId: 'tw_987654321',
      username: 'demo_agency',
      displayName: 'Demo Agency',
      avatar: 'https://via.placeholder.com/150?text=TW',
      accessToken: 'encrypted_token_twitter',
      refreshToken: 'encrypted_refresh_token_twitter',
      tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      metadata: {
        followersCount: 8932,
        followingCount: 456,
        tweetsCount: 1245,
      },
    },
  });

  const linkedinAccount = await prisma.socialAccount.create({
    data: {
      workspaceId: workspace.id,
      platform: 'LINKEDIN',
      platformAccountId: 'li_456789123',
      username: 'demo-agency',
      displayName: 'Demo Agency',
      avatar: 'https://via.placeholder.com/150?text=LI',
      accessToken: 'encrypted_token_linkedin',
      refreshToken: 'encrypted_refresh_token_linkedin',
      tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      metadata: {
        followersCount: 5234,
        connectionsCount: 1892,
      },
    },
  });

  // Create campaigns
  console.log('🎯 Creating campaigns...');
  const summerCampaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: 'Summer Product Launch 2024',
      description: 'Launch campaign for our new summer product line',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      status: 'ACTIVE',
      budget: 5000,
      tags: ['product-launch', 'summer', 'paid-ads'],
      utmParams: {
        source: 'social',
        medium: 'organic',
        campaign: 'summer-launch-2024',
      },
      goals: [
        { metric: 'reach', target: 100000, current: 45230 },
        { metric: 'engagement', target: 5000, current: 2341 },
        { metric: 'conversions', target: 500, current: 123 },
      ],
    },
  });

  const brandAwarenessCampaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      name: 'Brand Awareness Q2',
      description: 'Increase brand awareness and social following',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      status: 'ACTIVE',
      tags: ['brand-awareness', 'organic'],
      goals: [
        { metric: 'followers', target: 10000, current: 6234 },
        { metric: 'impressions', target: 500000, current: 312450 },
      ],
    },
  });

  // Create media assets
  console.log('🖼️ Creating media assets...');
  const mediaAssets = await prisma.mediaAsset.createMany({
    data: [
      {
        workspaceId: workspace.id,
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1557821552-17105176677c',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=300',
        filename: 'product-hero-1.jpg',
        size: 2456789,
        dimensions: { width: 1920, height: 1080 },
        tags: ['product', 'hero', 'summer'],
        folder: 'campaigns/summer-2024',
      },
      {
        workspaceId: workspace.id,
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
        filename: 'lifestyle-1.jpg',
        size: 1876543,
        dimensions: { width: 1920, height: 1080 },
        tags: ['lifestyle', 'brand'],
        folder: 'brand-assets',
      },
      {
        workspaceId: workspace.id,
        type: 'VIDEO',
        url: 'https://example.com/videos/product-demo.mp4',
        thumbnailUrl: 'https://example.com/videos/product-demo-thumb.jpg',
        filename: 'product-demo.mp4',
        size: 15678901,
        dimensions: { width: 1920, height: 1080 },
        duration: 45,
        tags: ['product', 'demo', 'video'],
        folder: 'campaigns/summer-2024',
      },
    ],
  });

  // Get media asset IDs for posts
  const allMediaAssets = await prisma.mediaAsset.findMany({
    where: { workspaceId: workspace.id },
  });

  // Create posts with different statuses
  console.log('📝 Creating posts...');
  
  // Published post
  const publishedPost = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: editor.id,
      status: 'PUBLISHED',
      content: {
        text: '🎉 Excited to announce our new summer collection! Check out these amazing products. #SummerVibes #NewCollection',
        hashtags: ['SummerVibes', 'NewCollection', 'Fashion'],
        mentions: [],
      },
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      campaignId: summerCampaign.id,
      tags: ['product-launch', 'announcement'],
      aiGenerated: false,
    },
  });

  await prisma.platformPost.createMany({
    data: [
      {
        postId: publishedPost.id,
        accountId: instagramAccount.id,
        platform: 'INSTAGRAM',
        platformPostId: 'ig_post_123',
        publishStatus: 'PUBLISHED',
        publishedAt: publishedPost.publishedAt,
      },
      {
        postId: publishedPost.id,
        accountId: twitterAccount.id,
        platform: 'TWITTER',
        platformPostId: 'tw_post_456',
        publishStatus: 'PUBLISHED',
        publishedAt: publishedPost.publishedAt,
      },
    ],
  });

  // Scheduled post
  const scheduledPost = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: editor.id,
      status: 'SCHEDULED',
      content: {
        text: 'Monday motivation! 💪 Start your week strong with our productivity tips. What are your goals this week?',
        hashtags: ['MondayMotivation', 'Productivity', 'Goals'],
        mentions: [],
      },
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      campaignId: brandAwarenessCampaign.id,
      tags: ['engagement', 'motivation'],
      aiGenerated: true,
      aiMetadata: {
        model: 'gpt-4o-mini',
        prompt: 'Create a motivational Monday post',
        cost: 0.0023,
      },
    },
  });

  await prisma.platformPost.createMany({
    data: [
      {
        postId: scheduledPost.id,
        accountId: instagramAccount.id,
        platform: 'INSTAGRAM',
        publishStatus: 'PENDING',
      },
      {
        postId: scheduledPost.id,
        accountId: linkedinAccount.id,
        platform: 'LINKEDIN',
        publishStatus: 'PENDING',
      },
    ],
  });

  // Draft post
  const draftPost = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: manager.id,
      status: 'DRAFT',
      content: {
        text: 'Working on something exciting... Stay tuned! 👀',
        hashtags: ['ComingSoon', 'StayTuned'],
        mentions: [],
      },
      tags: ['teaser'],
      aiGenerated: false,
    },
  });

  // Pending approval post
  const pendingPost = await prisma.post.create({
    data: {
      workspaceId: workspace.id,
      authorId: editor.id,
      status: 'PENDING_APPROVAL',
      content: {
        text: 'Big announcement coming tomorrow! 🚀 Our team has been working hard on something special for you.',
        hashtags: ['Announcement', 'ComingSoon'],
        mentions: [],
      },
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      campaignId: summerCampaign.id,
      tags: ['announcement'],
      aiGenerated: true,
    },
  });

  await prisma.approval.create({
    data: {
      postId: pendingPost.id,
      approverId: manager.id,
      status: 'PENDING',
      level: 1,
    },
  });

  // Create conversations
  console.log('💬 Creating conversations...');
  const conversation1 = await prisma.conversation.create({
    data: {
      workspaceId: workspace.id,
      accountId: instagramAccount.id,
      platform: 'INSTAGRAM',
      type: 'COMMENT',
      participantId: 'user_123',
      participantName: 'Jane Customer',
      participantAvatar: 'https://i.pravatar.cc/150?img=10',
      status: 'OPEN',
      priority: 'HIGH',
      sentiment: 'POSITIVE',
      assignedToId: editor.id,
      tags: ['product-inquiry', 'potential-sale'],
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        direction: 'INBOUND',
        content: 'Love this new collection! Is it available in size M?',
        platformMessageId: 'ig_msg_001',
        sentiment: 0.8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        conversationId: conversation1.id,
        direction: 'OUTBOUND',
        content: 'Thank you so much! Yes, size M is available. You can order it through the link in our bio! 😊',
        platformMessageId: 'ig_msg_002',
        authorId: editor.id,
        aiGenerated: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      workspaceId: workspace.id,
      accountId: twitterAccount.id,
      platform: 'TWITTER',
      type: 'MENTION',
      participantId: 'user_456',
      participantName: 'Tech Enthusiast',
      participantAvatar: 'https://i.pravatar.cc/150?img=11',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      sentiment: 'NEUTRAL',
      assignedToId: manager.id,
      tags: ['support', 'resolved'],
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      direction: 'INBOUND',
      content: '@demo_agency When will the new features be available?',
      platformMessageId: 'tw_msg_001',
      sentiment: 0.1,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // Create workflows
  console.log('⚙️ Creating workflows...');
  await prisma.workflow.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: 'Standard Approval Workflow',
        description: 'Two-level approval for all posts',
        type: 'APPROVAL',
        config: {
          levels: [
            { level: 1, approvers: [manager.id], required: true },
            { level: 2, approvers: [admin.id, owner.id], required: true },
          ],
          autoApprove: {
            enabled: true,
            conditions: {
              aiGenerated: false,
              authorRole: ['MANAGER', 'ADMIN', 'OWNER'],
            },
          },
        },
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Auto-Reply for Common Questions',
        description: 'Automated responses for frequently asked questions',
        type: 'AUTOMATION',
        config: {
          triggers: [
            {
              type: 'keyword',
              keywords: ['price', 'cost', 'how much'],
              response: 'Thank you for your interest! Please check our website for current pricing: https://example.com/pricing',
            },
            {
              type: 'keyword',
              keywords: ['hours', 'open', 'when'],
              response: 'We are open Monday-Friday, 9 AM - 6 PM EST. Feel free to reach out anytime!',
            },
          ],
        },
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Customer Support Chatbot',
        description: 'AI-powered chatbot for customer inquiries',
        type: 'CHATBOT',
        config: {
          intents: [
            {
              name: 'greeting',
              patterns: ['hi', 'hello', 'hey'],
              responses: ['Hello! How can I help you today?', 'Hi there! What can I do for you?'],
            },
            {
              name: 'product_info',
              patterns: ['tell me about', 'what is', 'product'],
              responses: ['I\'d be happy to help you learn about our products! Which one are you interested in?'],
            },
          ],
          fallback: 'I\'m not sure I understand. Let me connect you with a team member who can help!',
        },
        isActive: false,
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Workspace: ${workspace.name} (${workspace.slug})`);
  console.log(`- Users: 4 (Owner, Admin, Manager, Editor)`);
  console.log(`- Social Accounts: 3 (Instagram, Twitter, LinkedIn)`);
  console.log(`- Campaigns: 2`);
  console.log(`- Posts: 4 (1 published, 1 scheduled, 1 draft, 1 pending approval)`);
  console.log(`- Media Assets: 3`);
  console.log(`- Conversations: 2`);
  console.log(`- Workflows: 3`);
  console.log('\n🔑 Login credentials:');
  console.log('Email: owner@demo.com | Password: password123');
  console.log('Email: admin@demo.com | Password: password123');
  console.log('Email: manager@demo.com | Password: password123');
  console.log('Email: editor@demo.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
