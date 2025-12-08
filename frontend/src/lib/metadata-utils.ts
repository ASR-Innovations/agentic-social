/**
 * Metadata Generation Utilities
 * Helper functions for generating Next.js Metadata objects
 */

import { Metadata } from 'next';
import { siteConfig, PageSEO, getFullUrl, getOgImageUrl } from './seo-config';

/**
 * Truncate description to optimal SEO length (150-160 characters)
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength - 30) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Validate and ensure URL is absolute
 */
export function ensureAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return getFullUrl(url);
}

/**
 * Generate Next.js Metadata object from PageSEO configuration
 */
export function generatePageMetadata(
  pageSeo: PageSEO,
  options?: {
    pathname?: string;
    additionalKeywords?: string[];
  }
): Metadata {
  const { pathname = '', additionalKeywords = [] } = options || {};
  
  const title = pageSeo.title;
  const description = truncateDescription(pageSeo.description);
  const keywords = [...(pageSeo.keywords || []), ...additionalKeywords];
  const canonicalUrl = getFullUrl(pathname);
  
  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    
    // Robots configuration
    robots: pageSeo.robots ? {
      index: pageSeo.robots.index,
      follow: pageSeo.robots.follow,
      googleBot: {
        index: pageSeo.robots.index,
        follow: pageSeo.robots.follow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    } : undefined,
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },
    
    // Open Graph
    openGraph: {
      title: pageSeo.openGraph?.title || title,
      description: pageSeo.openGraph?.description || description,
      url: canonicalUrl,
      siteName: siteConfig.fullName,
      locale: siteConfig.locale,
      type: pageSeo.openGraph?.type || 'website',
      images: (pageSeo.openGraph?.images || [siteConfig.ogImage]).map(img => ({
        url: ensureAbsoluteUrl(img),
        width: 1200,
        height: 630,
        alt: pageSeo.openGraph?.title || title,
      })),
    },
    
    // Twitter Card
    twitter: {
      card: pageSeo.twitter?.card || 'summary_large_image',
      title: pageSeo.twitter?.title || pageSeo.openGraph?.title || title,
      description: pageSeo.twitter?.description || pageSeo.openGraph?.description || description,
      creator: siteConfig.twitterHandle,
      images: [getOgImageUrl()],
    },
  };
  
  return metadata;
}

/**
 * Generate metadata for protected/app pages (noindex by default)
 */
export function generateAppPageMetadata(
  title: string,
  description: string,
  pathname?: string
): Metadata {
  return generatePageMetadata(
    {
      title: `${title} | ${siteConfig.name}`,
      description,
      robots: { index: false, follow: false },
    },
    { pathname }
  );
}

/**
 * Generate metadata for public pages (indexed)
 */
export function generatePublicPageMetadata(
  pageSeo: PageSEO,
  pathname?: string
): Metadata {
  return generatePageMetadata(
    {
      ...pageSeo,
      robots: { index: true, follow: true },
    },
    { pathname }
  );
}

/**
 * Default metadata for the entire site (used in root layout)
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'social media management',
    'AI automation',
    'content creation',
    'social media scheduling',
    'analytics',
    'multi-platform',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.fullName,
    description: siteConfig.description,
    siteName: siteConfig.fullName,
    images: [
      {
        url: getOgImageUrl(),
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.fullName,
    description: siteConfig.description,
    images: [getOgImageUrl()],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};
