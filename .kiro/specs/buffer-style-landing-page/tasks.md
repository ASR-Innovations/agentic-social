# Implementation Plan

- [x] 1. Set up design system and Tailwind configuration
  - Extend Tailwind config with Buffer-style pastel colors (cream, pastel-pink, pastel-lavender, pastel-yellow, pastel-mint, pastel-blue, brand-green, footer-dark)
  - Add custom box shadows (buffer, buffer-lg)
  - Add CSS custom properties for 8px spacing scale
  - Configure Inter font family (already present, verify)
  - _Requirements: 16.1-16.9, 17.1-17.5, 18.1-18.5, 19.1-19.5_

- [x] 2. Create base component structure and shared utilities
  - Create `components/landing/` directory structure
  - Create shared TypeScript interfaces for component props (KPICardProps, FeatureCardProps, etc.)
  - Create content data file at `lib/landing-content.ts` with all page content
  - Set up test utilities and helpers for property-based testing
  - _Requirements: All sections_

- [ ]* 2.1 Write property test for component data structure
  - **Property 3: Feature card completeness**
  - **Validates: Requirements 5.2, 6.2, 7.4**

- [x] 3. Implement Navigation component
  - Create sticky navigation bar with transparent background
  - Add logo on left, center nav links ("Features", "Channels", "Resources", "Pricing")
  - Add right-aligned buttons ("Login" outline, "Get started for free" pill)
  - Implement scroll detection to reduce padding (py-6 → py-4)
  - Add mobile hamburger menu with overlay
  - _Requirements: 1.1-1.5_

- [ ]* 3.1 Write property test for navigation scroll behavior
  - **Property 1: Navigation scroll behavior**
  - **Validates: Requirements 1.4**

- [ ]* 3.2 Write unit tests for Navigation component
  - Test navigation renders with all required elements
  - Test mobile menu toggle functionality
  - Test responsive behavior at mobile breakpoint
  - _Requirements: 1.1-1.5_

- [x] 4. Implement Hero section
  - Create large centered headline "Your social media workspace" (56-64px desktop, 40px tablet, 32px mobile)
  - Add tagline below headline with generous spacing
  - Create horizontal input + CTA button row
  - Add floating social icons cluster with tiny shadows (decorative)
  - Implement light grid/dot pattern background on cream (#FBFBF8)
  - _Requirements: 2.1-2.5_

- [ ]* 4.1 Write unit tests for Hero section
  - Test headline renders with correct text and styling
  - Test CTA button renders with pill shape
  - Test floating social icons are present
  - _Requirements: 2.1-2.5_

- [x] 5. Implement Announcement Strip component
  - Create full-width rounded rectangle with pale yellow background (#FFF4D6)
  - Add "Community" badge on left with micro-icons
  - Add descriptive text in center and chevron arrow on right
  - Implement responsive padding and font size adjustments
  - _Requirements: 3.1-3.5_

- [x] 6. Implement KPI Strip with animated cards
  - Create KPICard component with white background, rounded-full shape, and elevation shadow
  - Display three KPI cards: "Active users", "Posts published last month", "Supported platforms"
  - Implement number animation from 0 to target value using Intersection Observer
  - Add responsive layout (horizontal on desktop, 2-column on mobile)
  - _Requirements: 4.1-4.5, 20.3_

- [ ]* 6.1 Write property test for KPI card styling consistency
  - **Property 2: KPI card styling consistency**
  - **Validates: Requirements 4.3**

- [ ]* 6.2 Write property test for KPI number animation
  - **Property 13: KPI number animation**
  - **Validates: Requirements 20.3**

- [ ]* 6.3 Write unit tests for KPI Strip
  - Test three KPI cards render
  - Test responsive grid layout
  - _Requirements: 4.1-4.5_

- [x] 7. Implement Feature Block with two-column cards
  - Create FeatureCard component with screenshot, heading, description, "Learn more →" link
  - Implement left card with pink background, right card with lavender background
  - Add soft rounded corners (16-24px), subtle shadow, tinted headers
  - Implement hover effects: translateY(-6px) and increased shadow
  - Add responsive stacking on mobile
  - _Requirements: 5.1-5.5_

- [ ]* 7.1 Write property test for card styling consistency
  - **Property 4: Card styling consistency**
  - **Validates: Requirements 5.3, 6.3, 7.2, 11.2, 12.3**

- [ ]* 7.2 Write property test for interactive hover effects
  - **Property 5: Interactive element hover effects**
  - **Validates: Requirements 5.4, 6.4, 8.4, 11.4, 14.4, 20.5**

- [ ]* 7.3 Write unit tests for Feature Block
  - Test two feature cards render
  - Test correct background colors (pink, lavender)
  - Test responsive stacking on mobile
  - _Requirements: 5.1-5.5_

- [x] 8. Implement Secondary Features Grid (2×2)
  - Create FeatureTile component with screenshot, heading, short copy
  - Display 2×2 grid with distinct pastel backgrounds (yellow, blue, pink, etc.)
  - Add rounded corners (16px) and hover effects
  - Implement responsive conversion to single column on mobile
  - _Requirements: 6.1-6.5_

- [ ]* 8.1 Write unit tests for Secondary Features Grid
  - Test 2×2 grid layout on desktop
  - Test single column on mobile
  - _Requirements: 6.1-6.5_

- [x] 9. Implement Feature Gallery row
  - Create MiniFeatureCard component with icon/image and brief text
  - Display heading "...and so much more!" followed by four mini cards
  - Use rounded corners, white backgrounds on pale area
  - Implement horizontal row on desktop, 2×2 grid on mobile
  - _Requirements: 7.1-7.5_

- [ ]* 9.1 Write unit tests for Feature Gallery
  - Test four mini cards render
  - Test responsive layout changes
  - _Requirements: 7.1-7.5_

- [x] 10. Implement Platform Grid with social icons
  - Create PlatformIcon component with consistent sizing
  - Display icons for major platforms (Twitter, Facebook, Instagram, LinkedIn, TikTok, YouTube, Pinterest, Threads, Reddit)
  - Add rounded container and hover effects (subtle scale)
  - Implement responsive wrapping on mobile
  - _Requirements: 8.1-8.5_

- [ ]* 10.1 Write property test for icon sizing consistency
  - **Property 6: Icon sizing consistency**
  - **Validates: Requirements 8.3**

- [ ]* 10.2 Write unit tests for Platform Grid
  - Test all platform icons render
  - Test responsive wrapping
  - _Requirements: 8.1-8.5_

- [x] 11. Implement Testimonial Area
  - Create TestimonialCard component with circular author photo/initials and caption
  - Display pale purple card with rounded corners
  - Show three circular author cards with consistent spacing
  - Implement responsive stacking (vertical or 2-column on mobile)
  - _Requirements: 9.1-9.5_

- [ ]* 11.1 Write property test for testimonial completeness
  - **Property 7: Testimonial card completeness**
  - **Validates: Requirements 9.3**

- [ ]* 11.2 Write property test for testimonial spacing consistency
  - **Property 8: Testimonial spacing consistency**
  - **Validates: Requirements 9.4**

- [ ]* 11.3 Write unit tests for Testimonial Area
  - Test three testimonial cards render
  - Test responsive layout
  - _Requirements: 9.1-9.5_

- [x] 12. Implement Customer Support Block
  - Create two-column layout with text (left) and team photo (right)
  - Add heading, descriptive paragraph, optional CTA button
  - Display team photo in rounded card with appropriate aspect ratio
  - Use white/light background with subtle shadow
  - Implement vertical stacking on mobile
  - _Requirements: 10.1-10.5_

- [ ]* 12.1 Write unit tests for Customer Support Block
  - Test two-column layout on desktop
  - Test vertical stacking on mobile
  - _Requirements: 10.1-10.5_

- [x] 13. Implement Resources Cards mosaic
  - Create ResourceCard component with title, description, optional icon/image
  - Display 3-column mosaic with pastel backgrounds and white images/text
  - Add hover effects (shadow or transform)
  - Implement single column layout on mobile
  - _Requirements: 11.1-11.5_

- [ ]* 13.1 Write property test for resource tile completeness
  - **Property 9: Resource tile completeness**
  - **Validates: Requirements 11.3**

- [ ]* 13.2 Write unit tests for Resources Cards
  - Test 3-column layout on desktop
  - Test single column on mobile
  - _Requirements: 11.1-11.5_

- [x] 14. Implement Company Stats Row
  - Create CompanyStatCard component with number, label, optional icon
  - Display small metric cards in horizontal row
  - Use consistent styling with rounded corners and subtle shadows
  - Implement even spacing between cards
  - Add responsive wrapping on mobile
  - _Requirements: 12.1-12.5_

- [ ]* 14.1 Write property test for stat card completeness
  - **Property 10: Stat card completeness**
  - **Validates: Requirements 12.2**

- [ ]* 14.2 Write property test for stat card spacing consistency
  - **Property 11: Stat card spacing consistency**
  - **Validates: Requirements 12.4**

- [ ]* 14.3 Write unit tests for Company Stats Row
  - Test stat cards render
  - Test responsive wrapping
  - _Requirements: 12.1-12.5_

- [x] 15. Implement CTA Band
  - Create full-width section with pale green background (#E8F9EF)
  - Add centered heading and centered CTA button
  - Style button with primary green (#36B37E) and pill shape (rounded-full)
  - Use generous vertical padding (py-16 or py-20)
  - Maintain centered alignment on mobile with adjusted font sizes
  - _Requirements: 13.1-13.5_

- [ ]* 15.1 Write unit tests for CTA Band
  - Test full-width section renders
  - Test button styling
  - _Requirements: 13.1-13.5_

- [x] 16. Implement Footer
  - Create dark green background (#0F2E2A) with light text
  - Display multi-column links organized by category (Product, Company, Resources, Legal)
  - Add large brand mark on left side
  - Implement hover effects on links (color change to white/lighter)
  - Show copyright text and social media icons at bottom
  - _Requirements: 14.1-14.5_

- [ ]* 16.1 Write unit tests for Footer
  - Test all footer columns render
  - Test brand mark is present
  - Test copyright and social icons
  - _Requirements: 14.1-14.5_

- [x] 17. Implement Cookie Notice
  - Create small floating card in bottom-right corner
  - Add brief text about cookie usage and action buttons
  - Use white background with rounded corners and shadow
  - Implement fade-out animation on Accept/Dismiss click
  - Persist acceptance state in localStorage
  - Adjust position to bottom-center on mobile
  - _Requirements: 15.1-15.5_

- [ ]* 17.1 Write property test for cookie notice interaction
  - **Property 12: Cookie notice interaction**
  - **Validates: Requirements 15.4**

- [ ]* 17.2 Write unit tests for Cookie Notice
  - Test cookie notice renders
  - Test dismiss functionality
  - Test localStorage persistence
  - _Requirements: 15.1-15.5_

- [ ] 18. Implement accessibility features across all components
  - Add descriptive alt text to all images
  - Add aria-labels to all buttons
  - Implement visible focus indicators on all interactive elements
  - Ensure minimum 44x44px touch targets on mobile
  - Verify 4.5:1 contrast ratio for all text on backgrounds
  - _Requirements: 24.1-24.5_

- [ ]* 18.1 Write property test for mobile touch target sizing
  - **Property 14: Mobile touch target sizing**
  - **Validates: Requirements 21.4**

- [ ]* 18.2 Write property test for text contrast accessibility
  - **Property 15: Text contrast accessibility**
  - **Validates: Requirements 24.1**

- [ ]* 18.3 Write property test for image alt text completeness
  - **Property 16: Image alt text completeness**
  - **Validates: Requirements 24.2**

- [ ]* 18.4 Write property test for button ARIA label completeness
  - **Property 17: Button ARIA label completeness**
  - **Validates: Requirements 24.3**

- [ ]* 18.5 Write property test for focus indicator visibility
  - **Property 18: Focus indicator visibility**
  - **Validates: Requirements 24.4**

- [x] 19. Integrate all components into main landing page
  - Update `app/page.tsx` to use all new landing components
  - Arrange components in correct vertical order
  - Ensure proper spacing between sections (48-72px)
  - Implement page container with max-width (1200-1400px)
  - Add smooth scroll behavior
  - _Requirements: All sections_

- [ ]* 19.1 Write integration tests for full page
  - Test all sections render in correct order
  - Test page scrolls smoothly
  - Test responsive behavior at all breakpoints
  - _Requirements: All sections_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Optimize performance and finalize
  - Implement lazy loading for below-the-fold images
  - Add `prefers-reduced-motion` support for animations
  - Optimize images using Next.js Image component
  - Test performance metrics (FCP, LCP, CLS, TTI)
  - Verify browser compatibility (Chrome, Firefox, Safari, Edge)
  - Test at exact breakpoint widths (768px, 1200px)
  - _Requirements: 21.1-21.5_

- [ ]* 21.1 Write performance tests
  - Test image lazy loading works
  - Test reduced motion preferences are respected
  - _Requirements: 21.5_

- [ ] 22. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

