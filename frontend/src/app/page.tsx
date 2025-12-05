'use client';

import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { AnnouncementStrip } from '@/components/landing/AnnouncementStrip';
import { KPIStrip } from '@/components/landing/KPIStrip';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { AIAgentsShowcase } from '@/components/landing/AIAgentsShowcase';
import { ContentGenerationBlock } from '@/components/landing/ContentGenerationBlock';
import { SchedulingFeature } from '@/components/landing/SchedulingFeature';
import { AnalyticsFeature } from '@/components/landing/AnalyticsFeature';
import { TeamCollaboration } from '@/components/landing/TeamCollaboration';
import { PlatformGrid } from '@/components/landing/PlatformGrid';
import { TestimonialArea } from '@/components/landing/TestimonialArea';
import { CustomerSupportBlock } from '@/components/landing/CustomerSupportBlock';
import { ResourcesCards } from '@/components/landing/ResourcesCards';
import { CompanyStatsRow } from '@/components/landing/CompanyStatsRow';
import { CTABand } from '@/components/landing/CTABand';
import { Footer } from '@/components/landing/Footer';
import { landingContent } from '@/lib/landing-content';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Announcement */}
      <AnnouncementStrip {...landingContent.announcement} />

      {/* KPI Stats */}
      <KPIStrip kpis={landingContent.kpis} />

      {/* AI Agents */}
      <section id="ai-agents">
        <AIAgentsShowcase agents={landingContent.aiAgents} />
      </section>

      {/* Content Generation */}
      <section id="features">
        <ContentGenerationBlock {...landingContent.contentGeneration} />
      </section>

      {/* Scheduling Feature */}
      <SchedulingFeature {...landingContent.scheduling} />

      {/* Analytics Feature */}
      <AnalyticsFeature {...landingContent.analytics} />

      {/* Team Collaboration */}
      <TeamCollaboration {...landingContent.teamCollaboration} />

      {/* Platforms */}
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

      {/* CTA */}
      <section id="pricing">
        <CTABand {...landingContent.cta} />
      </section>

      {/* Footer */}
      <Footer {...landingContent.footer} />

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}
