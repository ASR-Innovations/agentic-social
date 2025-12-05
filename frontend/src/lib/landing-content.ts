import { LandingPageContent } from './landing-types';

export const landingContent: LandingPageContent = {
  hero: {
    headline: 'Your AI-Powered Social Media Command Center',
    tagline: 'Automate content creation, scheduling, and analytics with 6 specialized AI agents that understand your brand voice and audience across 9 platforms.',
    ctaText: 'Get started for free',
    floatingSocialIcons: [
      { platform: 'Twitter', iconName: 'Twitter', position: { top: '20%', left: '10%' } },
      { platform: 'Facebook', iconName: 'Facebook', position: { top: '30%', left: '85%' } },
      { platform: 'Instagram', iconName: 'Instagram', position: { top: '60%', left: '15%' } },
      { platform: 'LinkedIn', iconName: 'Linkedin', position: { top: '50%', left: '80%' } },
      { platform: 'YouTube', iconName: 'Youtube', position: { top: '75%', left: '25%' } },
      { platform: 'TikTok', iconName: 'Zap', position: { top: '40%', left: '5%' } },
    ],
  },
  announcement: {
    badge: 'New',
    message: 'Introducing 6 AI Agents to supercharge your social media workflow',
    link: '#ai-agents',
  },
  kpis: [
    { value: '50K+', label: 'Active users', animateOnView: true },
    { value: '2M+', label: 'Posts published', animateOnView: true },
    { value: '9', label: 'Platforms supported', animateOnView: true },
    { value: '6', label: 'AI Agents', animateOnView: true },
  ],
  features: {
    primary: [
      {
        title: 'Plan and schedule your content',
        description: 'Organize your social media calendar with ease. Schedule posts across all 9 platforms and never miss the perfect posting time.',
        screenshot: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop&q=90',
        backgroundColor: 'pink',
        learnMoreLink: '#scheduling',
      },
      {
        title: 'Create engaging content with AI',
        description: 'AI-powered content generation using GPT-4, Claude, and DALL-E. Create posts, captions, images, and hashtags in seconds.',
        screenshot: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&q=90',
        backgroundColor: 'lavender',
        learnMoreLink: '#content-generation',
      },
    ],
    secondary: [
      {
        title: 'Analyze your performance',
        description: 'Track metrics that matter with real-time cross-platform analytics.',
        screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=90',
        backgroundColor: '#FFF4D6',
      },
      {
        title: 'Collaborate with your team',
        description: 'Work together seamlessly with role-based permissions and multi-tenant support.',
        screenshot: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop&q=90',
        backgroundColor: '#EAF6FF',
      },
      {
        title: 'Detect trends automatically',
        description: 'AI-powered trend detection identifies viral opportunities before they peak.',
        screenshot: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=800&fit=crop&q=90',
        backgroundColor: '#FDEAEA',
      },
      {
        title: 'Analyze competitors',
        description: 'Track competitor activity and identify market opportunities with AI insights.',
        screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&q=90',
        backgroundColor: '#E8F9EF',
      },
    ],
    mini: [
      { iconName: 'TrendingUp', title: 'Smart Analytics' },
      { iconName: 'Users', title: 'Team Collaboration' },
      { iconName: 'MessageCircle', title: 'AI Agents' },
      { iconName: 'Globe', title: '9 Platforms' },
    ],
  },

  // AI Agents data - 6 specialized agents
  aiAgents: [
    {
      id: 'content-creator',
      name: 'Content Creator',
      type: 'content_creator',
      description: 'Generates engaging posts, captions, and hashtags tailored to your brand voice',
      iconName: 'PenTool',
      capabilities: ['Post generation', 'Caption writing', 'Hashtag suggestions', 'Content variations'],
      color: '#FF6B6B',
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      type: 'strategy',
      description: 'Develops data-driven content strategies and optimal posting schedules',
      iconName: 'Target',
      capabilities: ['Content planning', 'Posting schedule', 'Audience targeting', 'Campaign strategy'],
      color: '#4ECDC4',
    },
    {
      id: 'engagement',
      name: 'Engagement Agent',
      type: 'engagement',
      description: 'Monitors and responds to audience interactions to boost engagement',
      iconName: 'MessageSquare',
      capabilities: ['Comment responses', 'DM management', 'Engagement tracking', 'Community building'],
      color: '#45B7D1',
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      type: 'analytics',
      description: 'Analyzes performance metrics and provides actionable insights',
      iconName: 'BarChart3',
      capabilities: ['Performance reports', 'Trend analysis', 'ROI tracking', 'Competitor benchmarking'],
      color: '#96CEB4',
    },
    {
      id: 'trend-detection',
      name: 'Trend Detection',
      type: 'trend_detection',
      description: 'Identifies trending topics and viral content opportunities',
      iconName: 'TrendingUp',
      capabilities: ['Trend monitoring', 'Viral prediction', 'Topic suggestions', 'Timing optimization'],
      color: '#FFEAA7',
    },
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      type: 'competitor_analysis',
      description: 'Tracks competitor activity and identifies market opportunities',
      iconName: 'Eye',
      capabilities: ['Competitor tracking', 'Market analysis', 'Gap identification', 'Benchmarking'],
      color: '#DDA0DD',
    },
  ],

  // Content Generation data - 4 types
  contentGeneration: {
    title: 'AI-Powered Content Creation',
    description: 'Generate high-quality content in seconds using the latest AI models',
    contentTypes: [
      {
        id: 'captions',
        title: 'Smart Captions',
        description: 'AI-generated captions optimized for each platform',
        iconName: 'Type',
        aiModel: 'GPT-4',
        example: '🚀 Excited to share our latest innovation...',
      },
      {
        id: 'content',
        title: 'Long-form Content',
        description: 'Articles, threads, and detailed posts',
        iconName: 'FileText',
        aiModel: 'Claude',
        example: 'In-depth analysis and thought leadership...',
      },
      {
        id: 'images',
        title: 'AI Images',
        description: 'Generate unique visuals for your posts',
        iconName: 'Image',
        aiModel: 'DALL-E 3',
        example: 'Custom graphics and illustrations...',
      },
      {
        id: 'hashtags',
        title: 'Hashtag Generator',
        description: 'Trending and relevant hashtags',
        iconName: 'Hash',
        aiModel: 'GPT-4',
        example: '#Innovation #Technology #Growth...',
      },
    ],
    ctaText: 'Try AI Content Generation',
    ctaLink: '/signup',
  },

  // Scheduling Feature data
  scheduling: {
    title: 'Smart Scheduling & Publishing',
    description: 'Plan, schedule, and publish content across all 9 platforms from one dashboard',
    features: [
      'Visual content calendar',
      'Multi-platform publishing',
      'Optimal time suggestions',
      'Queue management',
      'Bulk scheduling',
    ],
    calendarImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop&q=90',
    publishingOptions: [
      {
        type: 'draft',
        label: 'Save as Draft',
        description: 'Save your content for later editing',
        iconName: 'Edit3',
      },
      {
        type: 'scheduled',
        label: 'Schedule Post',
        description: 'Set a specific date and time to publish',
        iconName: 'Calendar',
      },
      {
        type: 'immediate',
        label: 'Publish Now',
        description: 'Instantly publish to selected platforms',
        iconName: 'Send',
      },
    ],
  },

  // Analytics Feature data
  analytics: {
    title: 'Cross-Platform Analytics',
    description: 'Track performance across all your social accounts in real-time',
    metrics: [
      { name: 'Impressions', iconName: 'Eye', description: 'Total views', value: '125K' },
      { name: 'Engagements', iconName: 'Heart', description: 'Likes, comments, shares', value: '8.7K' },
      { name: 'Engagement Rate', iconName: 'TrendingUp', description: 'Interaction percentage', value: '7.0%' },
      { name: 'Clicks', iconName: 'MousePointer', description: 'Link clicks', value: '3.2K' },
      { name: 'Shares', iconName: 'Share2', description: 'Content shares', value: '890' },
    ],
    dashboardImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=90',
    highlights: [
      'Real-time tracking',
      'Cross-platform aggregation',
      'Historical data analysis',
      'Custom date ranges',
      'Export reports',
    ],
  },

  // Team Collaboration data
  teamCollaboration: {
    title: 'Team Collaboration',
    description: 'Work together seamlessly with role-based access control and multi-tenant support',
    roles: [
      {
        name: 'Admin',
        permissions: ['Full access', 'User management', 'Billing', 'Settings'],
        iconName: 'Shield',
      },
      {
        name: 'Manager',
        permissions: ['Content approval', 'Analytics', 'Team management'],
        iconName: 'UserCheck',
      },
      {
        name: 'Editor',
        permissions: ['Create content', 'Schedule posts', 'View analytics'],
        iconName: 'Edit3',
      },
      {
        name: 'Viewer',
        permissions: ['View content', 'View analytics'],
        iconName: 'Eye',
      },
    ],
    features: [
      'Multi-tenant organizations',
      'User invitations',
      'Activity logging',
      'Approval workflows',
    ],
    teamImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop&q=90',
  },

  // 9 Supported Platforms
  platforms: [
    { platform: 'Twitter', iconName: 'Twitter' },
    { platform: 'Facebook', iconName: 'Facebook' },
    { platform: 'Instagram', iconName: 'Instagram' },
    { platform: 'LinkedIn', iconName: 'Linkedin' },
    { platform: 'YouTube', iconName: 'Youtube' },
    { platform: 'TikTok', iconName: 'Zap' },
    { platform: 'Pinterest', iconName: 'Target' },
    { platform: 'Threads', iconName: 'MessageCircle' },
    { platform: 'Reddit', iconName: 'MessageSquare' },
  ],

  testimonials: [
    {
      quote: 'The AI agents transformed our workflow completely. We\'re now posting 10x more content with half the team effort.',
      authorName: 'Sarah Chen',
      authorRole: 'Marketing Director',
      authorPhoto: 'SC',
    },
    {
      quote: 'The cross-platform analytics alone are worth the investment. We\'ve seen a 300% increase in engagement.',
      authorName: 'Michael Rodriguez',
      authorRole: 'CEO, TechStart',
      authorPhoto: 'MR',
    },
    {
      quote: 'Best social media tool we\'ve ever used. The AI content suggestions are incredibly accurate and on-brand.',
      authorName: 'Emily Watson',
      authorRole: 'Social Media Manager',
      authorPhoto: 'EW',
    },
  ],

  customerSupport: {
    heading: 'We\'re here to help',
    description: 'Our dedicated support team is available 24/7 to answer your questions and help you get the most out of our AI-powered platform.',
    ctaText: 'Contact Support',
    ctaLink: '#',
    teamPhoto: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop&q=90',
  },

  resources: [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics and get up and running in minutes.',
      backgroundColor: '#F3E8FF',
      link: '#',
    },
    {
      title: 'AI Agents Documentation',
      description: 'Deep dive into each AI agent\'s capabilities.',
      backgroundColor: '#EAF6FF',
      link: '#',
    },
    {
      title: 'API Documentation',
      description: 'Build custom integrations with our REST API.',
      backgroundColor: '#E8F9EF',
      link: '#',
    },
  ],

  companyStats: [
    { value: '2019', label: 'Founded', iconName: 'Globe' },
    { value: '50+', label: 'Team Members', iconName: 'Users' },
    { value: '99.9%', label: 'Uptime', iconName: 'TrendingUp' },
    { value: '24/7', label: 'Support', iconName: 'MessageCircle' },
  ],

  cta: {
    heading: 'Ready to transform your social media with AI?',
    ctaText: 'Get started for free',
    ctaLink: '/signup',
    secondaryCtaText: 'Contact Sales',
    secondaryCtaLink: '/contact',
  },

  footer: {
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'AI Agents', href: '#ai-agents' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Integrations', href: '#channels' },
          { label: 'API', href: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#' },
          { label: 'Blog', href: '#' },
          { label: 'Careers', href: '#' },
          { label: 'Contact', href: '#' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', href: '#' },
          { label: 'Help Center', href: '#' },
          { label: 'Community', href: '#' },
          { label: 'Status', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
          { label: 'Security', href: '#' },
          { label: 'Cookies', href: '#' },
        ],
      },
    ],
    socialLinks: [
      { label: 'Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
  },
};
