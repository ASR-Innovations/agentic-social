'use client';

import dynamic from 'next/dynamic';
import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { AnnouncementStrip } from '@/components/landing/AnnouncementStrip';
import { KPIStrip } from '@/components/landing/KPIStrip';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { landingContent } from '@/lib/landing-content';

// Lazy load below-the-fold components for better initial page load performance
const FeatureBlock = dynamic(() => import('@/components/landing/FeatureBlock').then(mod => ({ default: mod.FeatureBlock })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-white min-h-[400px]" />,
});

const SecondaryFeaturesGrid = dynamic(() => import('@/components/landing/SecondaryFeaturesGrid').then(mod => ({ default: mod.SecondaryFeaturesGrid })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-cream min-h-[400px]" />,
});

const FeatureGallery = dynamic(() => import('@/components/landing/FeatureGallery').then(mod => ({ default: mod.FeatureGallery })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-white min-h-[300px]" />,
});

const PlatformGrid = dynamic(() => import('@/components/landing/PlatformGrid').then(mod => ({ default: mod.PlatformGrid })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-cream min-h-[300px]" />,
});

const TestimonialArea = dynamic(() => import('@/components/landing/TestimonialArea').then(mod => ({ default: mod.TestimonialArea })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-pastel-lavender min-h-[400px]" />,
});

const CustomerSupportBlock = dynamic(() => import('@/components/landing/CustomerSupportBlock').then(mod => ({ default: mod.CustomerSupportBlock })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-white min-h-[400px]" />,
});

const ResourcesCards = dynamic(() => import('@/components/landing/ResourcesCards').then(mod => ({ default: mod.ResourcesCards })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-cream min-h-[400px]" />,
});

const CompanyStatsRow = dynamic(() => import('@/components/landing/CompanyStatsRow').then(mod => ({ default: mod.CompanyStatsRow })), {
  loading: () => <div className="py-16 px-6 lg:px-12 bg-white min-h-[200px]" />,
});

const CTABand = dynamic(() => import('@/components/landing/CTABand').then(mod => ({ default: mod.CTABand })), {
  loading: () => <div className="py-20 px-6 lg:px-12 bg-pastel-mint min-h-[300px]" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="py-16 px-6 lg:px-12 bg-footer-dark min-h-[400px]" />,
});

const CookieNotice = dynamic(() => import('@/components/landing/CookieNotice').then(mod => ({ default: mod.CookieNotice })), {
  ssr: false,
});

export default function HomePage() {
  // Load performance testing utilities in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    import('@/lib/test-performance').catch(() => {
      // Silently fail if module can't be loaded
    });
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Announcement Strip */}
      <AnnouncementStrip {...landingContent.announcement} />

      {/* KPI Strip */}
      <KPIStrip kpis={landingContent.kpis} />

      {/* Primary Feature Block */}
      <section id="features">
        <FeatureBlock features={landingContent.features.primary} />
      </section>

      {/* Secondary Features Grid */}
      <SecondaryFeaturesGrid features={landingContent.features.secondary} />

      {/* Feature Gallery */}
      <FeatureGallery features={landingContent.features.mini} />

      {/* Platform Grid */}
      <section id="channels">
        <PlatformGrid platforms={landingContent.platforms} />
      </section>

      {/* Testimonials */}
      <TestimonialArea testimonials={landingContent.testimonials} />

      {/* Customer Support */}
      <CustomerSupportBlock {...landingContent.customerSupport} />

      {/* Resources */}
      <ResourcesCards resources={landingContent.resources} />

      {/* Company Stats */}
      <CompanyStatsRow stats={landingContent.companyStats} />

      {/* CTA Band */}
      <section id="pricing">
        <CTABand {...landingContent.cta} />
      </section>

      {/* Footer */}
      <Footer {...landingContent.footer} />

      {/* Cookie Notice */}
      <CookieNotice />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
