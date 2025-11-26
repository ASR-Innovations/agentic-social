# Requirements Document

## Introduction

This specification defines the requirements for redesigning the onboarding page to achieve visual consistency with the landing page design system. The current onboarding page uses a dark gradient background (slate-900 to purple-900) which creates a jarring visual disconnect from the clean, minimalistic Buffer-style landing page that uses cream backgrounds and pastel accents. The redesign will ensure a cohesive user experience across all pages while maintaining a modern, professional aesthetic that doesn't feel AI-generated.

## Glossary

- **Onboarding Page**: The multi-step wizard interface that guides new users through initial setup including business profile, social account connections, AI configuration, team setup, and first post creation
- **Landing Page**: The public-facing homepage featuring the Buffer-style design with cream backgrounds, pastel colors, and brand green accents
- **Design System**: The collection of reusable design tokens including colors (cream, pastel variants, brand-green), typography (Inter font), spacing (8px scale), shadows (buffer, buffer-lg), and component patterns
- **Buffer-style Design**: A clean, minimalistic design approach characterized by generous whitespace, soft pastel backgrounds, subtle shadows, and friendly rounded corners
- **Visual Consistency**: The principle that all pages should share the same design language, color palette, typography, and component styling to create a unified user experience
- **Glass Morphism**: A design technique using backdrop blur and semi-transparent backgrounds (currently used in onboarding but not in landing page)
- **Brand Green**: The primary brand color (#36B37E) used for CTAs and accents throughout the application

## Requirements

### Requirement 1

**User Story:** As a new user, I want the onboarding page to visually match the landing page, so that I experience a seamless and professional brand identity throughout my journey.

#### Acceptance Criteria

1. WHEN a user navigates from the landing page to the onboarding page THEN the system SHALL maintain the same cream background color (#FBFBF8) as the landing page
2. WHEN the onboarding page renders THEN the system SHALL use the Buffer-style design tokens including pastel colors, brand-green accents, and buffer shadows
3. WHEN displaying cards and containers THEN the system SHALL use white backgrounds with buffer shadow instead of glass morphism effects
4. WHEN showing the progress indicator THEN the system SHALL use brand-green for active states instead of purple gradients
5. WHEN rendering buttons THEN the system SHALL use the brand-green color scheme consistent with the landing page CTAs

### Requirement 2

**User Story:** As a new user, I want the onboarding page to feel clean and modern, so that I trust the platform and feel confident proceeding with setup.

#### Acceptance Criteria

1. WHEN viewing the onboarding page THEN the system SHALL display generous whitespace following the 8px spacing scale
2. WHEN cards are displayed THEN the system SHALL use subtle buffer shadows (0 6px 18px rgba(15, 20, 20, 0.06)) instead of heavy shadow effects
3. WHEN text is rendered THEN the system SHALL use the Inter font family with appropriate weights (400 for body, 600 for headings)
4. WHEN interactive elements are hovered THEN the system SHALL provide subtle feedback without dramatic scale or glow effects
5. WHEN the page layout is viewed THEN the system SHALL maintain clean alignment and consistent border-radius values (12px for cards, 8px for buttons)

### Requirement 3

**User Story:** As a new user, I want the onboarding steps to be clearly organized and easy to follow, so that I can complete setup efficiently without confusion.

#### Acceptance Criteria

1. WHEN viewing the progress indicator THEN the system SHALL display step numbers and icons in a horizontal layout with connecting lines
2. WHEN a step is active THEN the system SHALL highlight it with brand-green color and appropriate visual emphasis
3. WHEN a step is completed THEN the system SHALL display a checkmark icon and maintain brand-green color
4. WHEN a step is inactive THEN the system SHALL display it in muted gray (text-muted: #6B6F72) to indicate future steps
5. WHEN step content is displayed THEN the system SHALL show clear headings, descriptions, and form fields with proper spacing

### Requirement 4

**User Story:** As a new user connecting social accounts, I want the platform cards to be visually appealing and clearly indicate connection status, so that I understand which accounts are linked.

#### Acceptance Criteria

1. WHEN social platform options are displayed THEN the system SHALL show each platform with its brand icon and colors in a clean card layout
2. WHEN a platform is not connected THEN the system SHALL display it with a white background and subtle border
3. WHEN a platform is connected THEN the system SHALL display it with a pastel-mint background (#E8F9EF) and green checkmark
4. WHEN hovering over a platform card THEN the system SHALL provide subtle visual feedback with a border color change
5. WHEN the connect button is displayed THEN the system SHALL use brand-green for primary actions and outline style for secondary actions

### Requirement 5

**User Story:** As a new user, I want the onboarding page to be responsive and accessible, so that I can complete setup on any device with any input method.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN the system SHALL adapt the layout to single-column with appropriate touch targets (minimum 44px)
2. WHEN using keyboard navigation THEN the system SHALL provide visible focus indicators using brand-green focus rings
3. WHEN screen readers are used THEN the system SHALL announce step progress and form field labels appropriately
4. WHEN the page loads THEN the system SHALL use smooth fade-in animations that respect prefers-reduced-motion settings
5. WHEN form validation occurs THEN the system SHALL display clear error messages in red (#ef4444) with appropriate ARIA attributes

### Requirement 6

**User Story:** As a new user, I want the navigation controls to be intuitive and consistent, so that I can move through the onboarding flow confidently.

#### Acceptance Criteria

1. WHEN navigation buttons are displayed THEN the system SHALL show "Back" and "Continue" buttons with clear visual hierarchy
2. WHEN on the first step THEN the system SHALL hide the "Back" button and show "Skip for now" option
3. WHEN on the last step THEN the system SHALL change the "Continue" button text to "Complete Setup"
4. WHEN clicking navigation buttons THEN the system SHALL provide immediate visual feedback and smooth transitions
5. WHEN the "Skip for now" option is displayed THEN the system SHALL style it as a ghost button in muted text color

### Requirement 7

**User Story:** As a new user, I want form inputs to be clean and easy to use, so that I can enter my information without frustration.

#### Acceptance Criteria

1. WHEN form inputs are displayed THEN the system SHALL use white backgrounds with subtle borders matching the landing page style
2. WHEN an input receives focus THEN the system SHALL display a brand-green focus ring without heavy glow effects
3. WHEN placeholder text is shown THEN the system SHALL use text-muted color (#6B6F72) for appropriate contrast
4. WHEN select dropdowns are rendered THEN the system SHALL match the input styling with consistent padding and borders
5. WHEN input icons are displayed THEN the system SHALL position them with appropriate spacing and muted colors

### Requirement 8

**User Story:** As a new user, I want the page header to match the landing page navigation, so that I maintain context of where I am in the application.

#### Acceptance Criteria

1. WHEN the onboarding page loads THEN the system SHALL display a navigation bar matching the landing page style with cream background
2. WHEN the logo is displayed THEN the system SHALL use the same brand-green rounded square icon with Sparkles and "SocialAI" text
3. WHEN the navigation bar is scrolled THEN the system SHALL maintain a fixed position with backdrop blur effect
4. WHEN viewing the header THEN the system SHALL include a subtle bottom border (border-gray-200) for visual separation
5. WHEN the logo is clicked THEN the system SHALL navigate back to the landing page
