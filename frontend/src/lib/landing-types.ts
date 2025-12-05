// TypeScript interfaces for Buffer-style landing page components

export interface SocialIcon {
  platform: string;
  iconName: string;
  position: { top: string; left: string };
}

export interface KPICardProps {
  value: string | number;
  label: string;
  animateOnView?: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  screenshot: string;
  backgroundColor: 'pink' | 'lavender' | 'yellow' | 'blue';
  learnMoreLink?: string;
}

export interface FeatureTileProps {
  title: string;
  description: string;
  screenshot: string;
  backgroundColor: string;
}

export interface MiniFeatureCardProps {
  iconName: string;
  title: string;
}

export interface PlatformIconProps {
  platform: string;
  iconName: string;
}

export interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorPhoto?: string;
  authorRole?: string;
}

export interface CustomerSupportBlockProps {
  heading: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  teamPhoto: string;
}

export interface ResourceCardProps {
  title: string;
  description: string;
  image?: string;
  backgroundColor: string;
  link?: string;
}

export interface CompanyStatCardProps {
  value: string | number;
  label: string;
  iconName?: string;
}

export interface CTABandProps {
  heading: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns: FooterColumn[];
  socialLinks: FooterLink[];
}

export interface AnnouncementStripProps {
  badge: string;
  message: string;
  link?: string;
}

// New interfaces for AI Agents
export type AgentType = 
  | 'content_creator'
  | 'strategy'
  | 'engagement'
  | 'analytics'
  | 'trend_detection'
  | 'competitor_analysis';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  iconName: string;
  capabilities: string[];
  color: string;
}

export interface AIAgentsShowcaseProps {
  agents: AIAgent[];
}

// New interfaces for Content Generation
export interface ContentType {
  id: string;
  title: string;
  description: string;
  iconName: string;
  aiModel: string;
  example?: string;
}

export interface ContentGenerationBlockProps {
  contentTypes: ContentType[];
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

// New interfaces for Scheduling Feature
export interface PublishingOption {
  type: 'draft' | 'scheduled' | 'immediate';
  label: string;
  description: string;
  iconName: string;
}

export interface SchedulingFeatureProps {
  title: string;
  description: string;
  features: string[];
  calendarImage: string;
  publishingOptions: PublishingOption[];
}

// New interfaces for Analytics Feature
export interface MetricType {
  name: string;
  iconName: string;
  description: string;
  value?: string;
}

export interface AnalyticsFeatureProps {
  title: string;
  description: string;
  metrics: MetricType[];
  dashboardImage: string;
  highlights: string[];
}

// New interfaces for Team Collaboration
export interface TeamRole {
  name: string;
  permissions: string[];
  iconName: string;
}

export interface TeamCollaborationProps {
  title: string;
  description: string;
  roles: TeamRole[];
  features: string[];
  teamImage: string;
}

// Extended Landing Page Content
export interface LandingPageContent {
  hero: {
    headline: string;
    tagline: string;
    ctaText: string;
    floatingSocialIcons: SocialIcon[];
  };
  announcement: AnnouncementStripProps;
  kpis: KPICardProps[];
  features: {
    primary: FeatureCardProps[];
    secondary: FeatureTileProps[];
    mini: MiniFeatureCardProps[];
  };
  platforms: PlatformIconProps[];
  testimonials: TestimonialCardProps[];
  customerSupport: CustomerSupportBlockProps;
  resources: ResourceCardProps[];
  companyStats: CompanyStatCardProps[];
  cta: CTABandProps;
  footer: FooterProps;
  // New sections
  aiAgents: AIAgent[];
  contentGeneration: ContentGenerationBlockProps;
  scheduling: SchedulingFeatureProps;
  analytics: AnalyticsFeatureProps;
  teamCollaboration: TeamCollaborationProps;
}
