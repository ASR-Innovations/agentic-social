# Implementation Plan

- [x] 1. Update page background and remove glass morphism effects
  - Replace dark gradient background (from-slate-900 via-purple-900) with cream background (#FBFBF8)
  - Remove floating background effect divs with purple/pink gradients
  - Update all glass-card classes to use white backgrounds with shadow-buffer
  - Remove backdrop-blur effects from card components
  - _Requirements: 1.1, 1.3_

- [x] 2. Integrate landing page navigation component
  - Import and use the Navigation component from landing page
  - Ensure cream background and brand-green logo are maintained
  - Add fixed positioning with backdrop-blur effect
  - Include subtle bottom border (border-gray-200)
  - Make logo clickable to navigate back to landing page
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Update progress indicator styling
  - Replace purple gradient colors with brand-green (#36B37E)
  - Update active step styling: brand-green background, white icon
  - Update completed step styling: brand-green background, white checkmark
  - Update inactive step styling: gray-200 border, text-muted (#6B6F72) icon
  - Update connecting lines: gray-200 for incomplete, brand-green for completed
  - Ensure horizontal layout with proper spacing
  - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Redesign step content cards
  - Update card backgrounds to white with shadow-buffer
  - Change icon container from purple gradient to brand-green solid
  - Update border-radius to rounded-2xl (16px)
  - Apply proper padding (p-8 / 32px)
  - Update title styling: text-2xl, font-semibold, text-primary
  - Update description styling: text-base, text-muted
  - _Requirements: 1.3, 2.2, 2.5, 3.5_

- [x] 5. Update form input components
  - Replace glass-input styling with white backgrounds and gray-200 borders
  - Apply rounded-lg (12px) border-radius
  - Ensure consistent padding (px-4 py-3)
  - Update focus states to use brand-green ring (ring-2 ring-brand-green)
  - Remove heavy glow effects from focus states
  - Update placeholder colors to text-muted (#6B6F72)
  - Position input icons with left-3 and text-muted color
  - _Requirements: 2.4, 7.1, 7.2, 7.3, 7.5_

- [ ]* 5.1 Write property test for input styling consistency
  - **Property 9: Input styling consistency**
  - **Validates: Requirements 7.1, 7.4**

- [ ]* 5.2 Write property test for input icon styling
  - **Property 10: Input icon styling**
  - **Validates: Requirements 7.5**

- [ ]* 5.3 Write property test for placeholder text consistency
  - **Property 11: Placeholder text consistency**
  - **Validates: Requirements 7.3**

- [x] 6. Update select dropdown styling
  - Match input styling with white background and gray-200 border
  - Apply consistent padding and border-radius
  - Update focus states to match inputs
  - Ensure proper spacing and alignment
  - _Requirements: 7.4_

- [x] 7. Redesign social platform cards
  - Update disconnected state: white background, gray-200 border
  - Update connected state: pastel-mint background (#E8F9EF), green-200 border
  - Add hover state: border changes to brand-green
  - Update connect button: brand-green for disconnected, outline for connected
  - Ensure platform icons maintain brand colors in rounded-xl containers
  - Add green checkmark for connected platforms
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 7.1 Write property test for platform card rendering
  - **Property 6: Platform card rendering**
  - **Validates: Requirements 4.1**

- [x] 8. Update navigation control buttons
  - Update Continue button: brand-green background, white text, rounded-lg
  - Update Back button: white background, gray-200 border, text-primary
  - Update Skip button: ghost style, text-muted
  - Ensure all buttons have h-11 (44px) for touch targets
  - Add subtle hover effects without dramatic scale or glow
  - Implement conditional rendering: hide Back on first step, show Skip
  - Change Continue text to "Complete Setup" on last step
  - _Requirements: 2.4, 6.1, 6.2, 6.3, 6.5_

- [ ]* 8.1 Write property test for button color consistency
  - **Property 3: Button color consistency**
  - **Validates: Requirements 1.5**

- [ ]* 8.2 Write property test for hover interaction subtlety
  - **Property 5: Hover interaction subtlety**
  - **Validates: Requirements 2.4**

- [x] 9. Update typography across all components
  - Ensure Inter font family is used throughout
  - Apply font-weight 400 for body text
  - Apply font-weight 600 for headings
  - Update text colors: text-primary (#0B1A17) for headings, text-muted (#6B6F72) for descriptions
  - _Requirements: 2.3_

- [ ]* 9.1 Write property test for typography consistency
  - **Property 4: Typography consistency**
  - **Validates: Requirements 2.3**

- [x] 10. Implement spacing consistency
  - Apply 8px spacing scale throughout (space-2, space-3, space-4)
  - Update card padding to p-8 (32px)
  - Update section gaps to gap-6 (24px)
  - Ensure generous whitespace between elements
  - _Requirements: 2.1, 2.5_

- [ ]* 10.1 Write property test for design token consistency
  - **Property 1: Design token consistency**
  - **Validates: Requirements 1.2, 2.1, 2.5**

- [ ]* 10.2 Write property test for card styling consistency
  - **Property 2: Card styling consistency**
  - **Validates: Requirements 1.3**

- [x] 11. Enhance accessibility features
  - Add visible focus indicators with brand-green focus rings
  - Ensure all form inputs have associated labels (htmlFor or aria-label)
  - Add aria-invalid and aria-describedby for error states
  - Implement proper ARIA attributes for progress indicator (aria-current)
  - Ensure logical tab order through all interactive elements
  - _Requirements: 5.2, 5.3_

- [ ]* 11.1 Write property test for keyboard focus visibility
  - **Property 7: Keyboard focus visibility**
  - **Validates: Requirements 5.2**

- [ ]* 11.2 Write property test for accessibility attributes
  - **Property 8: Accessibility attributes**
  - **Validates: Requirements 5.3**

- [x] 12. Implement responsive design
  - Add mobile breakpoint styles for single-column layout
  - Ensure touch targets are minimum 44px on mobile
  - Test and adjust spacing for mobile viewports
  - Verify horizontal scroll is prevented
  - _Requirements: 5.1_

- [x] 13. Add animation and motion preferences
  - Implement smooth fade-in animations for page load
  - Add smooth transitions between steps
  - Respect prefers-reduced-motion media query
  - Disable all animations when reduced motion is preferred
  - Ensure functionality works without animations
  - _Requirements: 5.4_

- [x] 14. Implement error handling and validation
  - Add form validation for required fields
  - Display error messages in red (#ef4444) below inputs
  - Add red borders to invalid inputs
  - Include aria-invalid attributes on error
  - Prevent step progression until errors are resolved
  - Show toast notifications for OAuth connection errors
  - _Requirements: 5.5_

- [x] 15. Update AI configuration step styling
  - Update brand voice option cards: white background, gray-200 border
  - Add hover states with brand-green border
  - Update automation level radio buttons with brand-green accent
  - Ensure proper spacing and alignment
  - _Requirements: 1.2, 2.1_

- [x] 16. Update team setup step styling
  - Update email input and role select to match new styling
  - Update invitation button to use brand-green
  - Ensure proper spacing and layout
  - _Requirements: 1.2, 7.1_

- [x] 17. Update first post step styling
  - Update textarea to match input styling (white background, gray-200 border)
  - Update "Generate with AI" button to use brand-green
  - Ensure proper spacing and layout
  - _Requirements: 1.2, 7.1_

- [x] 18. Remove unused gradient and glass morphism classes
  - Remove gradient-primary, gradient-secondary class usages
  - Remove glass, glass-card, glass-button class usages
  - Clean up any remaining purple color references
  - Remove animate-float classes from background effects
  - _Requirements: 1.3_

- [x] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Test cross-browser compatibility
  - Test in Chrome, Firefox, Safari, and Edge
  - Verify focus states work correctly in all browsers
  - Test backdrop-blur fallback if needed
  - Verify form styling consistency across browsers
  - _Requirements: 5.2_

- [ ]* 21. Create visual regression tests
  - Capture snapshots of each onboarding step
  - Set up baseline images for comparison
  - Verify no unintended visual changes
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 22. Perform accessibility audit
  - Run axe-core automated accessibility tests
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Verify keyboard-only navigation works correctly
  - Test with browser zoom at 200%
  - Verify WCAG 2.1 AA compliance
  - _Requirements: 5.2, 5.3_

- [x] 23. Final polish and refinement
  - Review all spacing and alignment
  - Verify color consistency with landing page
  - Test complete onboarding flow end-to-end
  - Verify OAuth callback handling works correctly
  - Test skip functionality
  - Verify final redirect to dashboard
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
