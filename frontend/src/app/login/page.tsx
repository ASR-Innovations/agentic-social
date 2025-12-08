import { Metadata } from 'next';
import { pageSEO } from '@/lib/seo-config';
import { generatePageMetadata } from '@/lib/metadata-utils';
import LoginPage from '@/components/pages/LoginPage';

// Generate SEO metadata for login page
export const metadata: Metadata = generatePageMetadata(pageSEO.login, { pathname: '/login' });

export default function Page() {
  return <LoginPage />;
}
