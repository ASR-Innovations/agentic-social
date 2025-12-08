import { Metadata } from 'next';
import { siteConfig } from '@/lib/seo-config';
import AppLayoutClient from '@/components/layouts/AppLayoutClient';

/**
 * Default metadata for all authenticated app pages
 * Sets noindex, nofollow to protect user content from search indexing
 */
export const metadata: Metadata = {
  title: {
    default: `Dashboard | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: 'Your AI-powered social media management dashboard. Manage content, analytics, and automation tools.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  // Prevent caching of authenticated pages
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
