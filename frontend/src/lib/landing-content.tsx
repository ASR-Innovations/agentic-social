import { LandingPageContent } from './landing-types';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube,
  MessageCircle,
  TrendingUp,
  Users,
  Globe,
  LucideIcon
} from 'lucide-react';

// Helper to convert icon component to ReactNode
const iconToNode = (Icon: LucideIcon, className?: string) => <Icon className={className} />;

export const landingContent: LandingPageContent = {
  hero: {
    headline: 'Your social media workspace',
    tagline: 'Automate content creation, scheduling, and analytics with AI agents that understand your brand voice and audience.',
    ctaText: 'Get started for free',
    floatingSocialIcons: [
      { platform: 'Twitter', icon: <Twitter className="w-6 h-6" />, position: { top: '20%', left: '10%' } },
      { platform: 'Facebook', icon: <Facebook className="w-6 h-6" />, position: { top: '30%', left: '85%' } },
      { platform: 'Instagram', icon: <Instagram className="w-6 h-6" />, position: { top: '60%', left: '15%' } },
      { platform: 'LinkedIn', icon: <Linkedin className="w-6 h-6" />, position: { top: '50%', left: '80%' } },
    ],
  },
  announcement: {
    badge: 'Community',
    message: 'Join 50,000+ teams already using SocialAI to grow their presence',
    link: '#',
  },
  kpis: [
    { value: '50K+', label: 'Active users', animateOnView: true },
    { value: '2M+', label: 'Posts published last month', animateOnView: true },
    { value: '9', label: 'Supported platforms', animateOnView: true },
  ],
  features: {
    primary: [
      {
        title: 'Plan and schedule your content',
        description: 'Organize your social media calendar with ease. Schedule posts across all platforms and never miss the perfect posting time.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: 'pink',
        learnMoreLink: '#',
      },
      {
        title: 'Create engaging content',
        description: 'AI-powered content generation that understands your brand voice. Create posts, captions, and hashtags in seconds.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: 'lavender',
        learnMoreLink: '#',
      },
    ],
    secondary: [
      {
        title: 'Analyze your performance',
        description: 'Track metrics that matter with real-time analytics.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: '#FFF4D6',
      },
      {
        title: 'Collaborate with your team',
        description: 'Work together seamlessly with role-based permissions.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: '#EAF6FF',
      },
      {
        title: 'Engage with your audience',
        description: 'Respond to comments and messages from one place.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: '#FDEAEA',
      },
      {
        title: 'Grow your reach',
        description: 'Discover trending topics and optimize your strategy.',
        screenshot: '/placeholder-screenshot.png',
        backgroundColor: '#E8F9EF',
      },
    ],
    mini: [
      { icon: <TrendingUp className="w-5 h-5" />, title: 'Smart Analytics' },
      { icon: <Users className="w-5 h-5" />, title: 'Team Collaboration' },
      { icon: <MessageCircle className="w-5 h-5" />, title: 'Unified Inbox' },
      { icon: <Globe className="w-5 h-5" />, title: 'Multi-Platform' },
    ],
  },
  platforms: [
    { platform: 'Twitter', icon: <Twitter className="w-6 h-6" /> },
    { platform: 'Facebook', icon: <Facebook className="w-6 h-6" /> },
    { platform: 'Instagram', icon: <Instagram className="w-6 h-6" /> },
    { platform: 'LinkedIn', icon: <Linkedin className="w-6 h-6" /> },
    { platform: 'YouTube', icon: <Youtube className="w-6 h-6" /> },
    { platform: 'TikTok', icon: <MessageCircle className="w-6 h-6" /> },
    { platform: 'Pinterest', icon: <TrendingUp className="w-6 h-6" /> },
    { platform: 'Threads', icon: <MessageCircle className="w-6 h-6" /> },
    { platform: 'Reddit', icon: <MessageCircle className="w-6 h-6" /> },
  ],
  testimonials: [
    {
      quote: 'SocialAI transformed our workflow completely. We\'re now posting 10x more content with half the team effort.',
      authorName: 'Sarah Chen',
      authorRole: 'Marketing Director',
      authorPhoto: 'SC',
    },
    {
      quote: 'The analytics alone are worth the investment. We\'ve seen a 300% increase in engagement.',
      authorName: 'Michael Rodriguez',
      authorRole: 'CEO',
      authorPhoto: 'MR',
    },
    {
      quote: 'Best social media tool we\'ve ever used. The AI content suggestions are incredibly accurate.',
      authorName: 'Emily Watson',
      authorRole: 'Social Media Manager',
      authorPhoto: 'EW',
    },
  ],
  customerSupport: {
    heading: 'We\'re here to help',
    description: 'Our dedicated support team is available 24/7 to answer your questions and help you get the most out of SocialAI.',
    ctaText: 'Contact Support',
    ctaLink: '#',
    teamPhoto: '/placeholder-team.png',
  },
  resources: [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics and get up and running in minutes.',
      backgroundColor: '#F3E8FF',
      link: '#',
    },
    {
      title: 'Best Practices',
      description: 'Tips and tricks from social media experts.',
      backgroundColor: '#EAF6FF',
      link: '#',
    },
    {
      title: 'API Documentation',
      description: 'Build custom integrations with our API.',
      backgroundColor: '#E8F9EF',
      link: '#',
    },
  ],
  companyStats: [
    { value: '2019', label: 'Founded', icon: <Globe className="w-5 h-5" /> },
    { value: '50+', label: 'Team Members', icon: <Users className="w-5 h-5" /> },
    { value: '99%', label: 'Uptime', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '24/7', label: 'Support', icon: <MessageCircle className="w-5 h-5" /> },
  ],
  cta: {
    heading: 'Ready to transform your social media?',
    ctaText: 'Get started for free',
    ctaLink: '/signup',
  },
  footer: {
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Integrations', href: '#' },
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
