# Design Document

## Overview

This design document outlines the comprehensive UI/UX enhancement strategy for all internal application pages of the AI Social Media Platform. The enhancement transforms the existing functional interface into a premium, Apple-inspired experience while preserving all existing functionality and business logic.

### Design Philosophy

The design follows Apple's Human Interface Guidelines principles:
- **Clarity**: Text is legible, icons are precise, adornments are subtle
- **Deference**: Fluid motion and crisp interface help people understand content
- **Depth**: Visual layers and realistic motion convey hierarchy and vitality

### Key Design Principles

1. **Minimalism with Purpose**: Every element serves a function; remove unnecessary decoration
2. **Generous Whitespace**: Allow content to breathe with ample spacing
3. **Subtle Depth**: Use shadows, gradients, and layering to create visual hierarchy
4. **Smooth Motion**: All animations feel natural and purposeful
5. **Consistent Patterns**: Reuse components and patterns across all pages
6. **Performance First**: Beautiful design that doesn't compromise speed

## Architecture

### Design System Structure

```
Design System
├── Foundation Layer
│   ├── Color Palette
│   ├── Typography Scale
│   ├── Spacing System
│   ├── Border Radius Scale
│   └── Shadow System
├── Component Layer
│   ├── Atoms (Button, Input, Badge, Icon)
│   ├── Molecules (Card, SearchBar, MetricCard)
│   ├── Organisms (Navigation, Header, Modal)
│   └── Templates (PageLayout, DashboardGrid)
└── Animation Layer
    ├── Transition Presets
    ├── Micro-interactions
    ├── Page Transitions
    └── Scroll Animations
```

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion for declarative animations
- **Icons**: Lucide React for consistent iconography
- **State Management**: Zustand for UI state
- **Performance**: React.lazy for code splitting, next/image for optimization

## Components and Interfaces

### Foundation Components

#### Color System

```typescript
// Design Tokens
const colors = {
  // Primary Palette - Indigo to Purple gradient
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',  // Primary
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Accent Palette - Multiple gradients for variety
  gradients: {
    primary: 'from-indigo-600 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-orange-500 to-red-500',
    info: 'from-blue-500 to-cyan-500',
    creative: 'from-pink-500 to-purple-500',
  },
  
  // Neutral Palette
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Background System
  background: {
    primary: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    card: 'bg-white/80 backdrop-blur-sm',
    elevated: 'bg-white',
  }
}
```

#### Typography System

```typescript
const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['SF Pro Display', 'Inter', 'sans-serif'],
  },
  
  // Type Scale
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

#### Spacing System

```typescript
const spacing = {
  // 4px base unit
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

#### Shadow System

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows for depth
  colored: {
    indigo: '0 10px 25px -5px rgb(99 102 241 / 0.2)',
    purple: '0 10px 25px -5px rgb(168 85 247 / 0.2)',
    blue: '0 10px 25px -5px rgb(59 130 246 / 0.2)',
  }
}
```

### Atomic Components

#### Enhanced Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

// Variants
const buttonVariants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg',
}

// Animation
const buttonAnimation = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeInOut' }
}
```

#### Enhanced Card Component

```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'glass' | 'gradient';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-lg',
  glass: 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg',
  gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200',
}

const cardAnimation = {
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

#### Enhanced Input Component

```typescript
interface InputProps {
  type: string;
  placeholder: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
}

const inputStyles = {
  base: 'w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-all',
  focus: 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  error: 'border-red-300 focus:ring-red-500',
  success: 'border-green-300 focus:ring-green-500',
  default: 'border-gray-200',
}
```

#### Enhanced Badge Component

```typescript
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
}
```

### Molecular Components

#### MetricCard Component

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
}

// Design
<Card variant="glass" hover>
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {change && (
        <Badge variant={trend === 'up' ? 'success' : 'error'}>
          {change}
        </Badge>
      )}
    </div>
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
  </div>
</Card>
```

#### SearchBar Component

```typescript
interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

// Design with icon and clear button
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 w-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
  />
  {value && (
    <button onClick={onClear} className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
    </button>
  )}
</div>
```

#### TabGroup Component

```typescript
interface TabGroupProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

// Design with pill-style tabs
<div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => onChange(tab.id)}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeTab === tab.id
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {tab.label}
      {tab.count && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
          activeTab === tab.id
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {tab.count}
        </span>
      )}
    </button>
  ))}
</div>
```

### Organism Components

#### Enhanced Navigation Sidebar

```typescript
interface SidebarProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Design Features:
// - Smooth slide animation
// - Active state with gradient background
// - Hover effects with scale
// - Badge indicators
// - User profile section at bottom
// - Glassmorphism effect

const sidebarAnimation = {
  open: { width: 280, opacity: 1 },
  closed: { width: 0, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' }
}
```

#### Enhanced Top Header

```typescript
interface HeaderProps {
  onSidebarToggle: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  notificationCount: number;
  user: User;
}

// Design Features:
// - Frosted glass effect with backdrop blur
// - Sticky positioning
// - Search bar with keyboard shortcut hint
// - Notification bell with badge
// - User avatar with dropdown
// - Responsive layout
```

#### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Animation
const modalAnimation = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

## Data Models

### Animation Configuration

```typescript
interface AnimationConfig {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 };
    animate: { opacity: 1, y: 0 };
    exit: { opacity: 0, y: -20 };
    transition: { duration: 0.3, ease: 'easeInOut' };
  };
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  // Card hover
  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      transition: { duration: 0.3 }
    }
  };
  
  // Button interactions
  buttonTap: {
    whileTap: { scale: 0.98 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 }
  };
  
  // Fade in up
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  };
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean;
}
```

### Page Layout Structure

```typescript
interface PageLayout {
  header: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
  };
  content: {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'sm' | 'md' | 'lg';
    background?: string;
  };
  sidebar?: {
    position: 'left' | 'right';
    width: number;
    content: React.ReactNode;
  };
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design Token Consistency

*For any* two page components within the application, when comparing their use of design tokens (colors, spacing, typography), they should use values from the same defined token system rather than arbitrary values.

**Validates: Requirements 1.1**

### Property 2: Animation Timing Consistency

*For any* interactive element with hover or click animations, the animation duration should be between 200-300ms to ensure consistent feel across the interface.

**Validates: Requirements 1.3, 2.2**

### Property 3: Responsive Layout Adaptation

*For any* page component, when rendered at mobile viewport width (< 768px), the layout should adapt by stacking elements vertically or collapsing navigation, maintaining all functionality.

**Validates: Requirements 1.4**

### Property 4: Staggered Animation Application

*For any* list or grid of items on page load, child elements should have staggered animation delays applied (each subsequent item delayed by 50-100ms) to create visual hierarchy.

**Validates: Requirements 2.1**

### Property 5: Hover State Responsiveness

*For any* interactive element (button, card, link), hovering should trigger a visual state change (scale, shadow, color) that completes within 300ms.

**Validates: Requirements 2.2, 4.5, 11.4**

### Property 6: Click Feedback Immediacy

*For any* clickable element, clicking should trigger an immediate visual state change (scale down, color change) before any async operation completes.

**Validates: Requirements 2.3**

### Property 7: Scroll Animation Triggering

*For any* page with scroll-triggered animations, elements should transition from hidden/initial state to visible/final state when they enter the viewport.

**Validates: Requirements 2.4**

### Property 8: Reduced Motion Respect

*For any* animated component, when the system prefers-reduced-motion setting is enabled, animations should either be disabled or reduced to simple fades without motion.

**Validates: Requirements 2.6**

### Property 9: View Mode Transition Smoothness

*For any* page with multiple view modes (grid/list/calendar), switching between views should trigger a layout transition animation rather than an instant jump.

**Validates: Requirements 4.1**

### Property 10: Filter Result Animation

*For any* filterable content list, when filter criteria change, the results should update with fade-out/fade-in transitions rather than instant replacement.

**Validates: Requirements 4.2**

### Property 11: Sidebar Toggle Animation

*For any* sidebar toggle action, the sidebar should animate open/closed with a smooth width transition over 300ms using easeInOut easing.

**Validates: Requirements 11.2**

### Property 12: Mobile Sidebar Overlay

*For any* viewport width less than 768px, the sidebar should render as an overlay with backdrop rather than pushing content, and should be closeable by clicking the backdrop.

**Validates: Requirements 11.5**

### Property 13: Button Gradient Consistency

*For any* primary action button across all pages, the button should use the same gradient class (from-indigo-600 to-purple-600) for visual consistency.

**Validates: Requirements 12.1**

### Property 14: Card Styling Consistency

*For any* card component across all pages, the card should use consistent border-radius (rounded-xl), shadow (shadow-lg), and padding classes.

**Validates: Requirements 12.2**

### Property 15: Input Focus State Consistency

*For any* input field across all pages, focusing the input should apply a consistent ring style (ring-2 ring-indigo-500) and remove the default border.

**Validates: Requirements 12.3**

### Property 16: Badge Color Consistency

*For any* badge component, the same variant (success/warning/error/info) should use the same color scheme across all pages.

**Validates: Requirements 12.4**

### Property 17: Modal Animation Consistency

*For any* modal or dialog, opening should animate with fade-in and scale-up (0.9 to 1.0) over 300ms, and closing should reverse the animation.

**Validates: Requirements 12.5**

### Property 18: Keyboard Focus Visibility

*For any* interactive element, when focused via keyboard navigation, a visible focus indicator (ring or outline) should be displayed.

**Validates: Requirements 13.1**

### Property 19: ARIA Label Presence

*For any* icon-only button or interactive element without visible text, an aria-label or aria-labelledby attribute should be present for screen readers.

**Validates: Requirements 13.2**

### Property 20: Color-Independent Information

*For any* element that uses color to convey information (status badges, trend indicators), an additional non-color indicator (icon or text) should also be present.

**Validates: Requirements 13.3**

### Property 21: Color Contrast Compliance

*For any* text element on a colored background, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 13.5**

### Property 22: Loading State Display

*For any* component that loads data asynchronously, a loading state (spinner, skeleton, or placeholder) should be displayed before the actual content renders.

**Validates: Requirements 14.4**

### Property 23: Framer Motion Usage Consistency

*For any* animated component, animations should be implemented using Framer Motion's motion components with consistent easing functions (easeInOut, easeOut).

**Validates: Requirements 15.3**

## Error Handling

### Animation Errors

**Scenario**: Animation fails to complete or causes performance issues

**Handling Strategy**:
1. Wrap animations in error boundaries
2. Provide fallback to non-animated state
3. Log animation errors for debugging
4. Respect prefers-reduced-motion as fallback

```typescript
const SafeAnimatedComponent = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }
  
  return (
    <ErrorBoundary fallback={<div>{children}</div>}>
      <motion.div {...animationProps}>
        {children}
      </motion.div>
    </ErrorBoundary>
  );
};
```

### Responsive Layout Errors

**Scenario**: Layout breaks at certain viewport sizes

**Handling Strategy**:
1. Use CSS Grid and Flexbox with fallbacks
2. Test at multiple breakpoints
3. Implement mobile-first approach
4. Use container queries where appropriate

### Theme/Style Loading Errors

**Scenario**: Custom styles fail to load

**Handling Strategy**:
1. Provide inline critical CSS
2. Fallback to system fonts if custom fonts fail
3. Use semantic HTML that works without styles
4. Progressive enhancement approach

### Image/Asset Loading Errors

**Scenario**: Images or icons fail to load

**Handling Strategy**:
1. Provide alt text for all images
2. Use fallback icons from Lucide React
3. Display placeholder on error
4. Lazy load non-critical images

```typescript
const SafeImage = ({ src, alt, fallback }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return fallback || <div className="bg-gray-200 rounded-lg" />;
  }
  
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
```

## Testing Strategy

### Unit Testing

**Component Testing**:
- Test that components render with correct props
- Test that event handlers are called correctly
- Test that conditional rendering works as expected
- Test that accessibility attributes are present

**Example**:
```typescript
describe('Button Component', () => {
  it('should render with primary variant styles', () => {
    const { container } = render(<Button variant="primary">Click me</Button>);
    expect(container.firstChild).toHaveClass('bg-gradient-to-r', 'from-indigo-600', 'to-purple-600');
  });
  
  it('should have aria-label when icon-only', () => {
    const { getByRole } = render(<Button icon={<Icon />} aria-label="Save" />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Save');
  });
});
```

### Property-Based Testing

**Testing Library**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations to ensure coverage across random inputs.

**Property Test Examples**:

```typescript
import fc from 'fast-check';

// Property 1: Design Token Consistency
describe('Design Token Consistency', () => {
  it('should use design tokens from the defined system', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Dashboard', 'Analytics', 'Content', 'AIHub'),
        (pageName) => {
          const page = renderPage(pageName);
          const colors = extractColors(page);
          return colors.every(color => isFromDesignSystem(color));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 13: Button Gradient Consistency
describe('Button Gradient Consistency', () => {
  it('should use consistent gradient for primary buttons across all pages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Dashboard', 'Analytics', 'Content', 'AIHub', 'Settings'),
        (pageName) => {
          const page = renderPage(pageName);
          const primaryButtons = page.querySelectorAll('[data-variant="primary"]');
          return Array.from(primaryButtons).every(button => 
            button.classList.contains('from-indigo-600') &&
            button.classList.contains('to-purple-600')
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 8: Reduced Motion Respect
describe('Reduced Motion Respect', () => {
  it('should disable or reduce animations when prefers-reduced-motion is set', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (prefersReducedMotion) => {
          mockMediaQuery('prefers-reduced-motion', prefersReducedMotion ? 'reduce' : 'no-preference');
          const component = render(<AnimatedCard />);
          const hasMotion = component.container.querySelector('[data-has-motion="true"]');
          return prefersReducedMotion ? !hasMotion : true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 12: Mobile Sidebar Overlay
describe('Mobile Sidebar Overlay', () => {
  it('should render sidebar as overlay on mobile viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          const layout = render(<AppLayout />);
          const sidebar = layout.getByTestId('sidebar');
          const isOverlay = sidebar.classList.contains('fixed') && 
                           sidebar.classList.contains('inset-0');
          return isOverlay;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 20: Color-Independent Information
describe('Color-Independent Information', () => {
  it('should provide non-color indicators alongside color coding', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('success', 'warning', 'error', 'info'),
        (variant) => {
          const badge = render(<Badge variant={variant}>Status</Badge>);
          const hasIcon = badge.container.querySelector('svg') !== null;
          const hasText = badge.container.textContent.length > 0;
          return hasIcon || hasText;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Page-Level Testing**:
- Test that pages render without errors
- Test that navigation between pages works
- Test that data fetching and display works
- Test that user interactions trigger expected behavior

**Example**:
```typescript
describe('Dashboard Page Integration', () => {
  it('should load and display metrics', async () => {
    const { findByText } = render(<DashboardPage />);
    expect(await findByText('Total Reach')).toBeInTheDocument();
    expect(await findByText('124.5K')).toBeInTheDocument();
  });
  
  it('should navigate to analytics when clicking view analytics', async () => {
    const { getByText } = render(<DashboardPage />);
    fireEvent.click(getByText('View Analytics'));
    expect(window.location.pathname).toBe('/app/analytics');
  });
});
```

### Visual Regression Testing

**Tool**: Percy or Chromatic for visual diff testing

**Strategy**:
- Capture screenshots of all pages in different states
- Compare against baseline screenshots
- Flag visual changes for review
- Test at multiple viewport sizes

### Accessibility Testing

**Tools**: 
- jest-axe for automated accessibility testing
- Manual testing with screen readers (NVDA, JAWS, VoiceOver)
- Keyboard navigation testing

**Example**:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Performance Testing

**Metrics to Track**:
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.8s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

**Tools**:
- Lighthouse CI for automated performance testing
- Chrome DevTools Performance panel
- React DevTools Profiler

**Example**:
```typescript
describe('Performance', () => {
  it('should render dashboard within performance budget', async () => {
    const startTime = performance.now();
    render(<DashboardPage />);
    await waitFor(() => screen.getByText('Dashboard'));
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // 1 second
  });
});
```

