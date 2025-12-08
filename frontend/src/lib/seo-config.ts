/**
 * SEO Configuration
 * Centralized SEO settings for the AI Social Media Platform
 */

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  robots?: {
    index: boolean;
    follow: boolean;
  };
  openGraph?: {
    title?: string;
    description?: string;
    images?: string[];
    type?: 'website' | 'article' | 'profile';
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
  };
}

export const siteConfig = {
  name: 'SocialAI',
  fullName: 'AI Social Media Platform',
  description: 'AI-powered social media management platform with intelligent multi-agent automation for content creation, scheduling, analytics, and engagement.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://socialai.com',
  ogImage: '/og-image.png',
  twitterHandle: '@socialaiplatform',
  locale: 'en_US',
  themeColor: '#10b981',
};

export const pageSEO: Record<string, PageSEO> = {
  // Public Pages
  home: {
    title: 'AI Social Media Management Platform | SocialAI - Automate Your Social Presence',
    description: 'Transform your social media strategy with AI-powered automation. Create engaging content, schedule posts, analyze performance, and grow your audience with intelligent multi-agent technology.',
    keywords: [
      'AI social media management',
      'social media automation',
      'AI content creation',
      'social media scheduling',
      'social media analytics',
      'multi-platform posting',
      'AI marketing tools',
      'social media AI',
      'content automation',
      'engagement automation',
      'social media platform',
      'AI agents',
      'Twitter automation',
      'Instagram automation',
      'LinkedIn automation',
      'Facebook automation',
    ],
    robots: { index: true, follow: true },
    openGraph: {
      title: 'SocialAI - AI-Powered Social Media Management Platform',
      description: 'Automate your social media with intelligent AI agents. Create content, schedule posts, and analyze performance across all platforms.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SocialAI - AI Social Media Management',
      description: 'Transform your social media with AI-powered automation. Create, schedule, and analyze across all platforms.',
    },
  },

  // Authentication Pages
  login: {
    title: 'Sign In | SocialAI - AI Social Media Platform',
    description: 'Sign in to your SocialAI account to access your AI-powered social media dashboard. Manage content, analytics, and automation tools.',
    keywords: ['SocialAI login', 'social media dashboard login', 'AI platform sign in'],
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Sign In to SocialAI',
      description: 'Access your AI-powered social media management dashboard.',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Sign In | SocialAI',
      description: 'Access your AI-powered social media dashboard.',
    },
  },

  signup: {
    title: 'Create Account | SocialAI - Start Your Free Trial',
    description: 'Join SocialAI and revolutionize your social media management with AI. Create your free account and start automating content creation, scheduling, and analytics.',
    keywords: ['SocialAI signup', 'create account', 'free trial', 'social media automation signup'],
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Create Your SocialAI Account',
      description: 'Start your free trial and transform your social media strategy with AI-powered automation.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Join SocialAI - Start Free Trial',
      description: 'Create your account and revolutionize your social media with AI.',
    },
  },

  onboarding: {
    title: 'Get Started | SocialAI - Set Up Your Account',
    description: 'Complete your SocialAI setup and connect your social media accounts. Configure AI agents and start automating your social presence.',
    robots: { index: false, follow: false },
  },

  // App Pages (Protected - noindex)
  dashboard: {
    title: 'Dashboard | SocialAI',
    description: 'Your AI-powered social media command center. View performance metrics, manage connected platforms, monitor AI agents, and track engagement across all channels.',
    robots: { index: false, follow: false },
  },

  analytics: {
    title: 'Analytics & Insights | SocialAI',
    description: 'Deep dive into your social media performance with AI-powered analytics. Track reach, engagement, follower growth, and get actionable insights to optimize your strategy.',
    robots: { index: false, follow: false },
  },

  team: {
    title: 'Team Management | SocialAI',
    description: 'Collaborate with your team on social media management. Invite members, assign roles, manage permissions, and streamline your workflow.',
    robots: { index: false, follow: false },
  },

  inbox: {
    title: 'Social Inbox | SocialAI',
    description: 'Unified inbox for all your social media messages, comments, and mentions. Respond to engagement across platforms from one place with AI-assisted replies.',
    robots: { index: false, follow: false },
  },

  content: {
    title: 'Content Hub | SocialAI',
    description: 'Create, schedule, and manage your social media content. Use AI to generate captions, find hashtags, and optimize posting times for maximum engagement.',
    robots: { index: false, follow: false },
  },

  aiHub: {
    title: 'AI Hub | SocialAI',
    description: 'Manage your AI agents and automation tools. Configure content creators, strategy advisors, engagement managers, and analytics experts for your social accounts.',
    robots: { index: false, follow: false },
  },

  media: {
    title: 'Media Library | SocialAI',
    description: 'Organize and manage your media assets. Upload images, videos, and documents for use across your social media posts and campaigns.',
    robots: { index: false, follow: false },
  },

  settings: {
    title: 'Settings | SocialAI',
    description: 'Configure your SocialAI account settings. Manage profile, connected platforms, AI preferences, notifications, security, and billing.',
    robots: { index: false, follow: false },
  },
};

/**
 * Get SEO configuration for a specific page
 */
export function getPageSEO(page: keyof typeof pageSEO): PageSEO {
  return pageSEO[page] || pageSEO.home;
}

/**
 * Generate full URL for a path
 */
export function getFullUrl(path: string = ''): string {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate OG image URL
 */
export function getOgImageUrl(image?: string): string {
  const imagePath = image || siteConfig.ogImage;
  return getFullUrl(imagePath);
}
