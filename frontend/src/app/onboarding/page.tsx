import { Metadata } from 'next';
import { pageSEO } from '@/lib/seo-config';
import { generatePageMetadata } from '@/lib/metadata-utils';
import OnboardingPage from '@/components/pages/OnboardingPage';

// Generate SEO metadata for onboarding page (noindex, nofollow)
export const metadata: Metadata = generatePageMetadata(pageSEO.onboarding, { pathname: '/onboarding' });

export default function Page() {
  return <OnboardingPage />;
}
