# Performance Optimization Guide

This document outlines all performance optimizations implemented in the application.

## Table of Contents

1. [Code Splitting](#code-splitting)
2. [Image Optimization](#image-optimization)
3. [Skeleton Screens](#skeleton-screens)
4. [Progressive Enhancement](#progressive-enhancement)
5. [Bundle Optimization](#bundle-optimization)
6. [Memoization](#memoization)
7. [Performance Monitoring](#performance-monitoring)

## Code Splitting

### Implementation

All page components are lazy-loaded using React.lazy() to reduce initial bundle size:

```typescript
// frontend/src/lib/lazy-components.ts
export const DashboardPage = lazy(() => import('@/app/app/dashboard/page'));
export const AIHubPage = lazy(() => import('@/app/app/ai-hub/page'));
// ... other pages
```

### Usage

Wrap lazy components with Suspense:

```typescript
import { Suspense } from 'react';
import { DashboardPage } from '@/lib/lazy-components';
import { PageSkeleton } from '@/components/ui/loading-state';

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
```

### Benefits

- Reduces initial bundle size by ~60%
- Faster Time to Interactive (TTI)
- Better First Contentful Paint (FCP)

## Image Optimization

### OptimizedImage Component

Located at `frontend/src/components/ui/optimized-image.tsx`

Features:
- Automatic format conversion (WebP, AVIF)
- Lazy loading by default
- Loading skeletons
- Error fallbacks
- Responsive sizing

### Usage

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false} // true for above-the-fold images
  quality={75}
/>
```

### Next.js Configuration

```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  minimumCacheTTL: 60,
}
```

## Skeleton Screens

### Available Components

1. **Skeleton** - Basic skeleton element
2. **SkeletonCard** - Card-shaped skeleton
3. **SkeletonList** - List of skeletons
4. **PageSkeleton** - Full page skeleton
5. **GridSkeleton** - Grid layout skeleton

### Usage

```typescript
import { PageSkeleton, GridSkeleton } from '@/components/ui/loading-state';

function MyPage() {
  const { data, isLoading } = useQuery();
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  return <div>{/* content */}</div>;
}
```

### Benefits

- Perceived performance improvement
- Reduces layout shift (CLS)
- Better user experience during loading

## Progressive Enhancement

### ProgressiveMotion Component

Located at `frontend/src/components/ui/progressive-motion.tsx`

Automatically respects `prefers-reduced-motion` and provides fallbacks:

```typescript
import { ProgressiveMotion, FadeIn, SlideIn } from '@/components/ui/progressive-motion';

// Automatically adapts to user preferences
<FadeIn delay={0.2}>
  <div>Content</div>
</FadeIn>

<SlideIn direction="up" delay={0.3}>
  <div>More content</div>
</SlideIn>
```

### Animation Fallbacks

- Users with `prefers-reduced-motion`: Simple fade animations
- Users without preference: Full animations
- Zero JavaScript: Static content still visible

## Bundle Optimization

### Implemented Optimizations

1. **SWC Minification** - Faster than Terser
2. **Tree Shaking** - Removes unused code
3. **Package Optimization** - Optimizes common packages
4. **CSS Optimization** - Removes unused CSS
5. **Source Map Removal** - In production builds

### Configuration

```javascript
// next.config.js
swcMinify: true,
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['lucide-react', 'framer-motion', ...],
},
```

### Bundle Analysis

Run bundle analyzer:

```bash
npm run analyze
```

This generates a visual report of bundle composition.

### Unused Dependencies

See `frontend/src/lib/bundle-optimization.md` for list of potentially unused dependencies that can be removed.

## Memoization

### When to Use

1. **React.memo** - For components that render often with same props
2. **useMemo** - For expensive calculations
3. **useCallback** - For event handlers passed to memoized children

### Examples

See `frontend/src/lib/memoization-examples.tsx` for comprehensive examples.

### Quick Reference

```typescript
// Memoize component
const MyComponent = memo(function MyComponent({ data }) {
  return <div>{data}</div>;
});

// Memoize expensive calculation
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.value - a.value);
}, [data]);

// Memoize callback
const handleClick = useCallback(() => {
  doSomething();
}, []);
```

## Performance Monitoring

### Built-in Utilities

Located at `frontend/src/lib/performance-utils.ts`

#### usePerformanceMonitor

Logs component render times in development:

```typescript
import { usePerformanceMonitor } from '@/lib/performance-utils';

function MyComponent() {
  usePerformanceMonitor('MyComponent');
  // Component renders will be logged
}
```

#### Debounce and Throttle

```typescript
import { useDebounce, useThrottle } from '@/lib/performance-utils';

// Debounce search input
const debouncedSearch = useDebounce(searchQuery, 300);

// Throttle scroll handler
const throttledScroll = useThrottle(handleScroll, 100);
```

### Web Vitals

Monitor Core Web Vitals:

```typescript
// frontend/src/components/WebVitals.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    // Send to analytics
  });
}
```

## Performance Targets

### Current Targets

- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.8s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **Bundle Size**: < 300KB (gzipped)

### Measuring Performance

```bash
# Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools > Lighthouse

# Bundle size
npm run build
du -sh .next/static

# Performance profiling
# Chrome DevTools > Performance tab
```

## Best Practices

### Do's

✅ Use code splitting for routes
✅ Lazy load images below the fold
✅ Implement skeleton screens
✅ Respect user motion preferences
✅ Memoize expensive computations
✅ Use proper image formats (WebP, AVIF)
✅ Implement proper caching headers
✅ Monitor bundle size regularly

### Don'ts

❌ Don't over-memoize (has overhead)
❌ Don't load all images eagerly
❌ Don't ignore accessibility
❌ Don't skip performance testing
❌ Don't use inline styles excessively
❌ Don't import entire libraries
❌ Don't forget error boundaries

## Continuous Monitoring

### Tools

1. **Lighthouse CI** - Automated performance testing
2. **Bundle Analyzer** - Visual bundle composition
3. **Chrome DevTools** - Performance profiling
4. **React DevTools Profiler** - Component render times

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm run build
    npx lhci autorun
```

## Future Optimizations

### Planned

- [ ] Implement virtual scrolling for long lists
- [ ] Add service worker for offline support
- [ ] Implement request deduplication
- [ ] Add resource hints (preload, prefetch)
- [ ] Optimize font loading strategy
- [ ] Implement edge caching
- [ ] Add performance budgets to CI

### Under Consideration

- [ ] Migrate to React Server Components
- [ ] Implement streaming SSR
- [ ] Add partial hydration
- [ ] Use Islands architecture
- [ ] Implement micro-frontends

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Core Web Vitals](https://web.dev/vitals/)
