import { Metadata } from 'next';
import { pageSEO } from '@/lib/seo-config';
import { generatePageMetadata } from '@/lib/metadata-utils';
import HomePage from '@/components/pages/HomePage';
import { HomePageStructuredData } from '@/components/seo/structured-data';

// Generate comprehensive SEO metadata for homepage
export const metadata: Metadata = generatePageMetadata(pageSEO.home, { pathname: '/' });

export default function Page() {
  return (
    <>
      <HomePageStructuredData />
      <HomePage />
    </>
  );
}
