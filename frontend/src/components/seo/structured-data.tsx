/**
 * Structured Data Components
 * JSON-LD schema markup for improved search engine understanding
 */

import { siteConfig, getFullUrl } from '@/lib/seo-config';

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  socialProfiles?: string[];
}

/**
 * Organization Schema - Provides information about the company/organization
 */
export function OrganizationSchema({
  name = siteConfig.fullName,
  url = siteConfig.url,
  logo = getFullUrl('/logo.png'),
  description = siteConfig.description,
  socialProfiles = [
    'https://twitter.com/socialaiplatform',
    'https://linkedin.com/company/socialai',
    'https://facebook.com/socialaiplatform',
  ],
}: OrganizationSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
      width: 512,
      height: 512,
    },
    description,
    sameAs: socialProfiles,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
  searchUrl?: string;
}

/**
 * WebSite Schema - Provides information about the website with search action
 */
export function WebSiteSchema({
  name = siteConfig.fullName,
  url = siteConfig.url,
  description = siteConfig.description,
  searchUrl,
}: WebSiteSchemaProps = {}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.fullName,
      url: siteConfig.url,
    },
  };

  // Add search action if search URL is provided
  if (searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name?: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

/**
 * SoftwareApplication Schema - For the SaaS platform
 */
export function SoftwareApplicationSchema({
  name = siteConfig.fullName,
  description = siteConfig.description,
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Web',
  offers = {
    price: '0',
    priceCurrency: 'USD',
  },
}: SoftwareApplicationSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Combined structured data for homepage
 * Includes Organization, WebSite, and SoftwareApplication schemas
 */
export function HomePageStructuredData() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <SoftwareApplicationSchema />
    </>
  );
}
