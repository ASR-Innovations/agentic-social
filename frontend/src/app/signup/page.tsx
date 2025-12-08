import { Metadata } from 'next';
import { pageSEO } from '@/lib/seo-config';
import { generatePageMetadata } from '@/lib/metadata-utils';
import SignupPage from '@/components/pages/SignupPage';

// Generate SEO metadata for signup page
export const metadata: Metadata = generatePageMetadata(pageSEO.signup, { pathname: '/signup' });

export default function Page() {
  return <SignupPage />;
}
