# Scroll Animations Guide

This guide explains how to use the scroll animation system implemented for the AI Social Media Platform. All animations automatically respect the user's `prefers-reduced-motion` accessibility setting.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Hooks](#hooks)
4. [Animation Variants](#animation-variants)
5. [Usage Examples](#usage-examples)
6. [Accessibility](#accessibility)
7. [Best Practices](#best-practices)

## Overview

The scroll animation system is built on top of Framer Motion and provides:

- **Scroll-triggered animations** that activate when elements enter the viewport
- **Progressive reveal** for page sections
- **Staggered animations** for lists and grids
- **Parallax effects** for hero sections
- **Automatic accessibility** - respects `prefers-reduced-motion`

## Components

### ScrollReveal

The `ScrollReveal` component is the easiest way to add scroll-triggered animations to any element.

```tsx
import ScrollReveal from '@/components/ui/scroll-reveal';

<ScrollReveal variant="fadeInUp">
  <h2>This will fade in and slide up when scrolled into view</h2>
</ScrollReveal>
```

**Props:**

- `variant`: Animation type - `'fade' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'`
- `customVariants`: Custom Framer Motion variants (overrides `variant`)
- `once`: Trigger once or every time (default: `true`)
- `amount`: Visibility threshold 0-1 (default: `0.1`)
- `delay`: Delay in seconds (default: `0`)
- `className`: Additional CSS classes
- `as`: HTML element to render (default: `'div'`)

### ScrollStagger

The `ScrollStagger` component creates staggered animations for lists and grids.

```tsx
import ScrollStagger from '@/components/ui/scroll-stagger';

<ScrollStagger>
  <ScrollStagger.Item>Item 1</ScrollStagger.Item>
  <ScrollStagger.Item>Item 2</ScrollStagger.Item>
  <ScrollStagger.Item>Item 3</ScrollStagger.Item>
</ScrollStagger>
```

**Props:**

- `staggerDelay`: Delay between each child (default: `0.1` seconds)
- `delayChildren`: Initial delay before first child (default: `0.1` seconds)
- `containerVariants`: Custom container variants
- `itemVariants`: Custom item variants
- `once`: Trigger once or every time (default: `true`)
- `amount`: Visibility threshold 0-1 (default: `0.2`)
- `className`: Additional CSS classes
- `as`: HTML element to render (default: `'div'`)

### Parallax

The `Parallax` component creates parallax scroll effects.

```tsx
import { Parallax } from '@/components/ui/parallax';

<Parallax speed={0.5}>
  <img src="/hero-bg.jpg" alt="Background" />
</Parallax>
```

**Props:**

- `speed`: Parallax speed 0-1 (default: `0.5`)
- `direction`: `'vertical' | 'horizontal'` (default: `'vertical'`)
- `className`: Additional CSS classes
- `as`: HTML element to render (default: `'div'`)

**Additional Components:**

- `ParallaxLayer`: For multi-layer parallax with z-index control
- `ParallaxSection`: Full-width section with background image support

## Hooks

### useScrollAnimation

The core hook for scroll-triggered animations.

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { scrollFadeInUp } from '@/lib/animations';

function MyComponent() {
  const { ref, animationState } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animationState}
      variants={scrollFadeInUp}
    >
      Content
    </motion.div>
  );
}
```

**Options:**

- `once`: Trigger once or every time (default: `true`)
- `amount`: Visibility threshold 0-1 (default: `0.1`)
- `margin`: Viewport margin for early/late triggering (default: `'0px'`)
- `disabled`: Disable animation (default: `false`)

**Returns:**

- `ref`: Ref to attach to element
- `inView`: Whether element is in viewport
- `shouldAnimate`: Whether animations should run (respects reduced motion)
- `animationState`: `'visible' | 'hidden'` for use with variants

### useScrollStagger

Specialized hook for staggered list animations.

```tsx
import { useScrollStagger } from '@/hooks/useScrollAnimation';

const { ref, animationState } = useScrollStagger({
  once: true,
  amount: 0.2,
});
```

### useParallax

Hook for parallax effects.

```tsx
import { useParallax } from '@/hooks/useScrollAnimation';

const { ref, speed, shouldAnimate } = useParallax(0.5);
```

### useProgressiveReveal

Hook optimized for progressive section reveals.

```tsx
import { useProgressiveReveal } from '@/hooks/useScrollAnimation';

const { ref, animationState } = useProgressiveReveal();
```

## Animation Variants

Pre-built animation variants are available in `@/lib/animations`:

### Scroll Animations

- `scrollFadeIn`: Simple fade in
- `scrollFadeInUp`: Fade in with upward slide
- `scrollFadeInDown`: Fade in with downward slide
- `scrollFadeInLeft`: Fade in from left
- `scrollFadeInRight`: Fade in from right
- `scrollScaleIn`: Fade in with scale

### Stagger Animations

- `scrollStaggerContainer`: Container for staggered children
- `scrollStaggerItem`: Individual staggered item

### Parallax Animations

- `parallaxSlow`: Slow parallax movement (-20px)
- `parallaxMedium`: Medium parallax movement (-40px)
- `parallaxFast`: Fast parallax movement (-60px)

### Custom Animations

Create custom scroll animations:

```tsx
import { createScrollAnimation } from '@/lib/animations';

const customAnimation = createScrollAnimation('up', 100, 0.8);
```

## Usage Examples

### Basic Scroll Reveal

```tsx
<ScrollReveal variant="fadeInUp">
  <h1>Welcome to our platform</h1>
</ScrollReveal>
```

### Staggered Grid

```tsx
<ScrollStagger className="grid grid-cols-3 gap-4">
  {items.map(item => (
    <ScrollStagger.Item key={item.id}>
      <Card>{item.content}</Card>
    </ScrollStagger.Item>
  ))}
</ScrollStagger>
```

### Multiple Sections with Different Delays

```tsx
<ScrollReveal variant="fadeInUp">
  <section>Section 1</section>
</ScrollReveal>

<ScrollReveal variant="fadeInUp" delay={0.2}>
  <section>Section 2</section>
</ScrollReveal>

<ScrollReveal variant="fadeInUp" delay={0.4}>
  <section>Section 3</section>
</ScrollReveal>
```

### Parallax Hero Section

```tsx
import { ParallaxSection } from '@/components/ui/parallax';

<ParallaxSection
  speed={0.3}
  backgroundImage="/hero-bg.jpg"
  overlayOpacity={0.5}
  className="min-h-screen flex items-center justify-center"
>
  <h1 className="text-6xl font-bold text-white">Hero Title</h1>
</ParallaxSection>
```

### Multi-Layer Parallax

```tsx
import { ParallaxLayer } from '@/components/ui/parallax';

<div className="relative min-h-screen">
  <ParallaxLayer speed={0.2} zIndex={1} className="absolute inset-0">
    <img src="/bg-far.jpg" alt="Far background" />
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.5} zIndex={2} className="absolute inset-0">
    <img src="/bg-mid.jpg" alt="Mid background" />
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.8} zIndex={3} className="absolute inset-0">
    <img src="/bg-near.jpg" alt="Near background" />
  </ParallaxLayer>
  
  <div className="relative z-10">
    <h1>Content</h1>
  </div>
</div>
```

### Custom Animation with Hook

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

function CustomComponent() {
  const { ref, animationState } = useScrollAnimation({
    once: false, // Trigger every time
    amount: 0.5, // 50% visible
  });

  const customVariants = {
    hidden: { opacity: 0, rotate: -10 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { duration: 0.8 }
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animationState}
      variants={customVariants}
    >
      Custom animated content
    </motion.div>
  );
}
```

### Staggered List with Custom Timing

```tsx
<ScrollStagger 
  staggerDelay={0.05} 
  delayChildren={0.2}
  className="space-y-4"
>
  {mentions.map(mention => (
    <ScrollStagger.Item key={mention.id}>
      <MentionCard mention={mention} />
    </ScrollStagger.Item>
  ))}
</ScrollStagger>
```

## Accessibility

All scroll animations automatically respect the user's accessibility preferences:

### Reduced Motion

When a user has `prefers-reduced-motion: reduce` enabled:

- All scroll animations are disabled
- Elements appear immediately without animation
- Parallax effects are disabled
- The user experience remains fully functional

### How It Works

The `usePrefersReducedMotion` hook from `@/lib/accessibility` detects the system preference:

```tsx
import { usePrefersReducedMotion } from '@/lib/accessibility';

const prefersReducedMotion = usePrefersReducedMotion();

// All scroll animation hooks automatically use this
```

### Manual Control

You can manually disable animations:

```tsx
<ScrollReveal variant="fadeInUp" disabled={true}>
  <Content />
</ScrollReveal>
```

## Best Practices

### 1. Use Appropriate Thresholds

- **Small elements**: `amount={0.1}` - Trigger early
- **Large sections**: `amount={0.3}` - Trigger when more visible
- **Full-screen sections**: `amount={0.5}` - Trigger at midpoint

### 2. Stagger Timing

- **Fast lists**: `staggerDelay={0.05}` - Quick succession
- **Normal lists**: `staggerDelay={0.1}` - Standard timing
- **Slow reveals**: `staggerDelay={0.2}` - Dramatic effect

### 3. Animation Direction

- **Content flowing down**: Use `fadeInUp` (slides up into view)
- **Sidebar content**: Use `fadeInLeft` or `fadeInRight`
- **Hero sections**: Use `scaleIn` for impact

### 4. Performance

- Use `once={true}` for most animations to avoid re-triggering
- Avoid animating too many elements simultaneously
- Use `will-change` CSS property sparingly

### 5. Parallax Speed

- **Background layers**: `speed={0.2}` - Subtle movement
- **Mid-ground**: `speed={0.5}` - Moderate movement
- **Foreground**: `speed={0.8}` - Pronounced movement

### 6. Progressive Reveal

For long pages with multiple sections:

```tsx
{sections.map((section, index) => (
  <ScrollReveal 
    key={section.id}
    variant="fadeInUp"
    delay={0}
  >
    <Section {...section} />
  </ScrollReveal>
))}
```

### 7. Combining Animations

You can nest scroll animations:

```tsx
<ScrollReveal variant="fadeInUp">
  <Card>
    <ScrollStagger>
      <ScrollStagger.Item>Item 1</ScrollStagger.Item>
      <ScrollStagger.Item>Item 2</ScrollStagger.Item>
    </ScrollStagger>
  </Card>
</ScrollReveal>
```

## Testing

To test reduced motion behavior:

### Chrome DevTools

1. Open DevTools (F12)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "reduce"

### System Settings

**macOS:**
System Preferences → Accessibility → Display → Reduce motion

**Windows:**
Settings → Ease of Access → Display → Show animations

**Linux:**
Varies by desktop environment

## Migration from Existing Code

To migrate existing animations to use scroll triggers:

**Before:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

**After:**
```tsx
<ScrollReveal variant="fadeInUp">
  <div>Content</div>
</ScrollReveal>
```

Or with the hook:

```tsx
const { ref, animationState } = useScrollAnimation();

<motion.div
  ref={ref}
  initial="hidden"
  animate={animationState}
  variants={scrollFadeInUp}
>
  Content
</motion.div>
```

## Troubleshooting

### Animations not triggering

- Check that the element has the `ref` attached
- Verify the `amount` threshold is appropriate for element size
- Ensure the element is actually scrolling into view

### Animations triggering too early/late

- Adjust the `amount` prop (0-1)
- Use the `margin` option to add viewport offset
- Check parent container overflow settings

### Performance issues

- Reduce number of simultaneously animated elements
- Use `once={true}` to prevent re-triggering
- Simplify animation variants
- Check for layout thrashing

## Support

For questions or issues with scroll animations, refer to:

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
- Project design document: `.kiro/specs/app-pages-ui-enhancement/design.md`
