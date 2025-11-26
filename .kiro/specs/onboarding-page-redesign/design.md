# Design Document

## Overview

The onboarding page redesign transforms the current dark gradient aesthetic into a clean, Buffer-style design that seamlessly matches the landing page. This redesign eliminates visual discontinuity by adopting the established design system: cream backgrounds, pastel accents, brand-green primary color, subtle shadows, and generous whitespace. The result is a professional, trustworthy onboarding experience that feels cohesive with the rest of the application.

The redesign maintains the existing five-step flow (Business Profile, Connect Platforms, AI Configuration, Team Setup, First Post) while updating all visual elements to align with the Buffer-style design language. The implementation focuses on replacing glass morphism effects with solid white cards, swapping purple gradients for brand-green accents, and ensuring all interactive elements follow the established patterns from the landing page.

## Architecture

### Component Structure

The onboarding page follows a container-presenter pattern with the following hierarchy:

```
OnboardingPage (Container)
├── Navigation (Shared Component)
├── OnboardingHeader
│   ├── Logo
│   └── StepIndicator
├── ProgressBar
│   └── StepDots[]
├── StepContent (Card)
│   ├── StepIcon
│   ├── StepTitle
│   ├── StepDescription
│   └── StepForm (Dynamic)
│       ├── BusinessProfileForm
│       ├── SocialAccountsStep
│       ├── AIConfigurationForm
│       ├── TeamSetupForm
│       └── FirstPostForm
└── NavigationControls
    ├── BackButton
    ├── SkipButton
    └── ContinueButton
```

### Design System Integration

The redesign leverages existing Tailwind configuration:

**Colors:**
- Background: `cream` (#FBFBF8)
- Card backgrounds: `white`
- Primary actions: `brand-green` (#36B37E)
- Text primary: `text-primary` (#0B1A17)
- Text muted: `text-muted` (#6B6F72)
- Success states: `pastel-mint` (#E8F9EF)
- Borders: `gray-200`

**Typography:**
- Font family: Inter (already configured)
- Headings: font-semibold (600)
- Body: font-normal (400)
- Labels: font-medium (500)

**Spacing:**
- Uses 8px scale: space-2 (16px), space-3 (24px), space-4 (32px)
- Card padding: p-8 (32px)
- Section gaps: gap-6 (24px)

**Shadows:**
- Cards: `shadow-buffer` (0 6px 18px rgba(15, 20, 20, 0.06))
- Hover states: `shadow-buffer-lg` (0 12px 24px rgba(15, 20, 20, 0.08))

**Border Radius:**
- Cards: rounded-2xl (16px)
- Buttons: rounded-lg (12px)
- Inputs: rounded-lg (12px)
- Icons: rounded-xl (12px)

## Components and Interfaces

### Navigation Component

Reuses the existing `Navigation` component from the landing page with minimal modifications:

```typescript
interface NavigationProps {
  variant?: 'landing' | 'onboarding';
  showBackLink?: boolean;
}
```

The onboarding variant maintains the same cream background and brand-green logo but may hide navigation links to keep users focused on the onboarding flow.

### ProgressBar Component

```typescript
interface ProgressBarProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  completed: boolean;
}
```

**Visual Design:**
- Horizontal layout with step circles connected by lines
- Active step: brand-green background, white icon
- Completed step: brand-green background, white checkmark
- Inactive step: gray-200 border, text-muted icon
- Connecting lines: gray-200 for incomplete, brand-green for completed
- Step labels below circles: text-sm, text-primary for active, text-muted for inactive

### StepContent Card

```typescript
interface StepContentProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}
```

**Visual Design:**
- White background with shadow-buffer
- Rounded-2xl corners
- Padding: p-8
- Icon container: w-16 h-16, rounded-2xl, bg-brand-green, white icon
- Title: text-2xl, font-semibold, text-primary
- Description: text-base, text-muted, mt-2

### SocialAccountsStep Component

```typescript
interface PlatformCardProps {
  platform: SocialPlatform;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (platform: string) => void;
}

interface SocialPlatform {
  name: string;
  platform: string;
  icon: LucideIcon;
  brandColor: string;
}
```

**Visual Design:**

*Disconnected State:*
- White background
- Border: border-gray-200
- Hover: border-brand-green
- Icon: platform brand color in rounded-xl container
- Button: brand-green with white text

*Connected State:*
- Background: pastel-mint (#E8F9EF)
- Border: border-green-200
- Icon: platform brand color in rounded-xl container
- Checkmark: text-green-600, displayed next to platform name
- Button: outline style with green colors

### Form Input Components

```typescript
interface FormInputProps {
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'password';
  icon?: LucideIcon;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}
```

**Visual Design:**
- Label: text-sm, font-medium, text-primary, mb-2
- Input container: relative positioning for icon
- Input: white background, border-gray-200, rounded-lg, px-4 py-3
- Focus state: ring-2 ring-brand-green, border-brand-green
- Icon: absolute left-3, text-muted
- Error: text-sm, text-red-500, mt-1

### NavigationControls Component

```typescript
interface NavigationControlsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}
```

**Visual Design:**
- Container: flex justify-between items-center
- Back button: secondary style (white bg, border-gray-200, text-primary)
- Skip button: ghost style (transparent, text-muted)
- Continue button: brand-green bg, white text, rounded-lg
- Button heights: h-11 (44px for touch targets)
- Hover states: subtle shadow and slight brightness change

## Data Models

### OnboardingState

```typescript
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  businessProfile: BusinessProfile;
  connectedAccounts: ConnectedAccount[];
  aiConfiguration: AIConfiguration;
  teamMembers: TeamMember[];
  firstPost: PostDraft | null;
}

interface BusinessProfile {
  businessName: string;
  industry: string;
  companySize: string;
}

interface ConnectedAccount {
  platform: string;
  accountId: string;
  accountName: string;
  connectedAt: Date;
}

interface AIConfiguration {
  brandVoice: 'professional' | 'casual' | 'friendly' | 'bold';
  automationLevel: 'assisted' | 'autonomous';
}

interface TeamMember {
  email: string;
  role: 'editor' | 'manager' | 'viewer';
  invitedAt: Date;
  status: 'pending' | 'accepted';
}

interface PostDraft {
  content: string;
  platforms: string[];
  scheduledFor?: Date;
}
```

## Correct
ness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design token consistency

*For any* component rendered on the onboarding page, all design tokens (colors, spacing, shadows, border-radius) should match the values defined in the Tailwind configuration and used on the landing page.
**Validates: Requirements 1.2, 2.1, 2.5**

### Property 2: Card styling consistency

*For any* card or container component, the background should be white, the shadow should be buffer shadow (0 6px 18px rgba(15, 20, 20, 0.06)), and there should be no glass morphism effects (no backdrop-blur).
**Validates: Requirements 1.3**

### Property 3: Button color consistency

*For any* primary action button, the background color should be brand-green (#36B37E) and the text should be white, matching the landing page CTA styling.
**Validates: Requirements 1.5**

### Property 4: Typography consistency

*For any* text element, the font-family should be Inter, body text should have font-weight 400, and headings should have font-weight 600.
**Validates: Requirements 2.3**

### Property 5: Hover interaction subtlety

*For any* interactive element in hover state, the transform scale should not exceed 1.02 and there should be no glow box-shadows (no shadows with blur > 20px and spread > 0).
**Validates: Requirements 2.4**

### Property 6: Platform card rendering

*For any* social platform in the platform list, the card should render with the platform's brand icon, name, and appropriate connection button.
**Validates: Requirements 4.1**

### Property 7: Keyboard focus visibility

*For any* focusable element, when focused via keyboard navigation, a visible focus ring with brand-green color should be displayed.
**Validates: Requirements 5.2**

### Property 8: Accessibility attributes

*For any* form input, there should be an associated label (via htmlFor or aria-label), and error states should include aria-invalid and aria-describedby attributes.
**Validates: Requirements 5.3**

### Property 9: Input styling consistency

*For any* form input or select element, the background should be white, border should be gray-200, border-radius should be rounded-lg (12px), and padding should be consistent (px-4 py-3).
**Validates: Requirements 7.1, 7.4**

### Property 10: Input icon styling

*For any* input with an icon, the icon should be positioned absolutely on the left with appropriate spacing (left-3), and the icon color should be text-muted (#6B6F72).
**Validates: Requirements 7.5**

### Property 11: Placeholder text consistency

*For any* input with placeholder text, the placeholder color should be text-muted (#6B6F72).
**Validates: Requirements 7.3**

## Error Handling

### Visual Error States

**Form Validation Errors:**
- Display inline error messages below inputs
- Use red color (#ef4444) for error text
- Add red border to invalid inputs
- Include aria-invalid="true" attribute
- Prevent form submission until errors are resolved

**Connection Errors:**
- Show toast notifications for OAuth failures
- Display error state in platform cards with retry button
- Provide clear error messages (e.g., "Failed to connect Twitter. Please try again.")
- Log errors to console for debugging

**Navigation Errors:**
- Validate required fields before allowing step progression
- Show validation summary if multiple fields are invalid
- Highlight the first invalid field
- Scroll to error location if not in viewport

### Loading States

**OAuth Connection:**
- Show "Connecting..." text on button
- Disable button during connection
- Display spinner icon
- Prevent multiple simultaneous connections

**Step Transitions:**
- Use smooth fade transitions between steps
- Maintain button disabled state during transition
- Show loading spinner on Continue button if async validation occurs

### Edge Cases

**Empty States:**
- Show helpful message if no social accounts connected: "You can connect platforms later from settings"
- Display placeholder content in team setup if no invitations sent

**Browser Compatibility:**
- Provide fallback for backdrop-blur if not supported
- Ensure focus-visible works across browsers
- Test in Safari, Chrome, Firefox, Edge

**Reduced Motion:**
- Respect prefers-reduced-motion media query
- Disable all animations and transitions
- Maintain functionality without animations

## Testing Strategy

### Unit Testing

**Component Rendering:**
- Test each step component renders without errors
- Verify correct props are passed to child components
- Test conditional rendering (e.g., Back button on first step)
- Verify button text changes on last step

**State Management:**
- Test step navigation (next, back, skip)
- Verify completed steps are tracked correctly
- Test form data persistence across steps
- Verify OAuth callback handling

**Form Validation:**
- Test email validation in team setup
- Test required field validation in business profile
- Verify error messages display correctly
- Test form submission prevention when invalid

### Property-Based Testing

The property-based tests will use **React Testing Library** with **fast-check** for property generation. Each test should run a minimum of 100 iterations.

**Property Test 1: Design Token Consistency**
- Generate random component types (button, card, input)
- Render each component
- Verify computed styles match design tokens
- **Feature: onboarding-page-redesign, Property 1: Design token consistency**

**Property Test 2: Card Styling Consistency**
- Generate random card content
- Render cards with different content
- Verify all cards have white background and buffer shadow
- Verify no backdrop-blur is present
- **Feature: onboarding-page-redesign, Property 2: Card styling consistency**

**Property Test 3: Button Color Consistency**
- Generate random button labels and states
- Render primary buttons
- Verify all have brand-green background
- **Feature: onboarding-page-redesign, Property 3: Button color consistency**

**Property Test 4: Typography Consistency**
- Generate random text content
- Render headings and body text
- Verify font-family is Inter
- Verify font-weights are correct (400 for body, 600 for headings)
- **Feature: onboarding-page-redesign, Property 4: Typography consistency**

**Property Test 5: Hover Interaction Subtlety**
- Generate random interactive elements
- Simulate hover state
- Verify transform scale ≤ 1.02
- Verify no glow shadows present
- **Feature: onboarding-page-redesign, Property 5: Hover interaction subtlety**

**Property Test 6: Platform Card Rendering**
- Generate random platform configurations
- Render platform cards
- Verify each has icon, name, and button
- **Feature: onboarding-page-redesign, Property 6: Platform card rendering**

**Property Test 7: Keyboard Focus Visibility**
- Generate random focusable elements
- Simulate keyboard focus
- Verify focus ring is visible
- Verify focus ring color is brand-green
- **Feature: onboarding-page-redesign, Property 7: Keyboard focus visibility**

**Property Test 8: Accessibility Attributes**
- Generate random form inputs
- Render inputs
- Verify label association exists
- Verify error states include aria-invalid and aria-describedby
- **Feature: onboarding-page-redesign, Property 8: Accessibility attributes**

**Property Test 9: Input Styling Consistency**
- Generate random input types (text, email, select)
- Render inputs
- Verify white background, gray-200 border, rounded-lg, consistent padding
- **Feature: onboarding-page-redesign, Property 9: Input styling consistency**

**Property Test 10: Input Icon Styling**
- Generate random inputs with icons
- Render inputs
- Verify icon position (left-3) and color (text-muted)
- **Feature: onboarding-page-redesign, Property 10: Input icon styling**

**Property Test 11: Placeholder Text Consistency**
- Generate random inputs with placeholders
- Render inputs
- Verify placeholder color is text-muted
- **Feature: onboarding-page-redesign, Property 11: Placeholder text consistency**

### Integration Testing

**OAuth Flow:**
- Test complete OAuth connection flow
- Verify redirect to provider
- Test callback handling
- Verify account appears as connected

**Multi-Step Flow:**
- Test completing all steps in sequence
- Verify data persists across steps
- Test skip functionality
- Verify final redirect to dashboard

**Responsive Behavior:**
- Test layout at mobile breakpoints (320px, 375px, 768px)
- Verify touch targets are minimum 44px
- Test keyboard navigation on mobile
- Verify no horizontal scroll

### Visual Regression Testing

**Snapshot Tests:**
- Capture snapshots of each step
- Compare against baseline
- Verify no unintended visual changes
- Test both light and dark modes (if applicable)

**Cross-Browser Testing:**
- Test in Chrome, Firefox, Safari, Edge
- Verify consistent rendering
- Test focus states across browsers
- Verify animations work correctly

### Accessibility Testing

**Automated Testing:**
- Run axe-core accessibility tests
- Verify WCAG 2.1 AA compliance
- Test color contrast ratios
- Verify semantic HTML structure

**Manual Testing:**
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test keyboard-only navigation
- Verify focus order is logical
- Test with browser zoom at 200%

## Implementation Notes

### Migration Strategy

1. **Create new component variants** alongside existing ones
2. **Update one step at a time** to minimize risk
3. **Test each step** before moving to the next
4. **Remove old glass morphism styles** after all steps are updated
5. **Update global styles** to remove unused gradient classes

### Performance Considerations

- Use React.memo for step components to prevent unnecessary re-renders
- Lazy load platform icons if bundle size is a concern
- Optimize animations with CSS transforms (GPU-accelerated)
- Use will-change sparingly for hover states
- Debounce form validation to reduce re-renders

### Browser Support

- Target modern browsers (last 2 versions)
- Provide fallbacks for backdrop-blur
- Test in Safari for iOS (webkit-specific issues)
- Ensure focus-visible polyfill if needed
- Test in Firefox for form styling differences

### Maintenance

- Document design token usage in component comments
- Create Storybook stories for each component variant
- Maintain design system documentation
- Regular accessibility audits
- Monitor analytics for drop-off rates at each step
