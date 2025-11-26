// TypeScript interfaces for Buffer-style landing page components

export interface SocialIcon {
  platform: string;
  icon: React.ReactNode;
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
  icon: React.ReactNode;
  title: string;
}

export interface PlatformIconProps {
  platform: string;
  icon: React.ReactNode;
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
  icon?: React.ReactNode;
}

export interface CTABandProps {
  heading: string;
  ctaText: string;
  ctaLink: string;
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
}
