# Performance Testing Guide

This guide explains how to test the performance optimizations implemented for the Buffer-style landing page.

## Overview

The landing page has been optimized for:
- ✅ Lazy loading of below-the-fold components
- ✅ `prefers-reduced-motion` support for animations
- ✅ Optimized images using Next.js Image component
- ✅ Performance monitoring and Core Web Vitals tracking
- ✅ Browser compatibility testing

## Testing Performance Metrics

### 1. Core Web Vitals

The application automatically tracks and reports Core Web Vitals in development mode:

- **FCP (First Contentful Paint)**: Target < 1.5s
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **TTI (Time to Interactive)**: Target < 3.5s

**How to test:**
1. Open the landing page in development mode
2. Open browser DevTools Console
3. Look for performance metrics logged automatically
4. Or run: `window.performanceTests.run()`

### 2. Lazy Loading Verification

**Test that below-the-fold components are lazy loaded:**

```javascript
// In browser console
window.performanceTests.run()
```

This will show:
- Total images on page
- Number of lazy-loaded images
- Number of eager-loaded images

**Expected behavior:**
- Hero section images: eager loaded (above the fold)
- Feature block images: lazy loaded (below the fold)
- All other images: lazy loaded

### 3. Reduced Motion Support

**Test animation behavior with reduced motion preference:**

**Method 1: Browser DevTools**
1. Open Chrome DevTools
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "Emulate CSS prefers-reduced-motion: reduce"
5. Reload the page

**Method 2: System Settings**
- **macOS**: System Preferences → Accessibility → Display → Reduce motion
- **Windows**: Settings → Ease of Access → Display → Show animations
- **Linux**: Varies by desktop environment

**Expected behavior:**
- KPI number animations: instant (no counting animation)
- Floating social icons: no floating animation
- Hover effects: instant transitions
- All other animations: disabled or instant

**Verify in console:**
```javascript
window.performanceTests.generateReport()
// Check the "prefersReducedMotion" field
```

### 4. Image Optimization

**Verify Next.js Image optimization:**

1. Open Network tab in DevTools
2. Filter by "Img"
3. Reload the page
4. Check that images are:
   - Served in WebP format (when supported)
   - Properly sized (not oversized)
   - Lazy loaded (check "Initiator" column)

**Expected attributes on images:**
- `loading="lazy"` for below-the-fold images
- `quality={85}` for optimized file size
- `placeholder="blur"` for smooth loading

### 5. Breakpoint Testing

**Test at exact breakpoint widths:**

```javascript
// Test at mobile breakpoint
window.performanceTests.testBreakpoint(768)

// Test at desktop breakpoint
window.performanceTests.testBreakpoint(1200)
```

**Manual testing:**
1. Resize browser to exactly 768px width
2. Check layout transitions smoothly
3. Resize to exactly 1200px width
4. Verify no layout breaks

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1199px
- Desktop: ≥ 1200px

### 6. Browser Compatibility

**Test in multiple browsers:**

```javascript
window.performanceTests.testBrowser()
```

This checks support for:
- IntersectionObserver (lazy loading)
- ResizeObserver (responsive behavior)
- CSS Grid & Flexbox
- CSS Custom Properties
- Backdrop Filter
- Aspect Ratio
- WebP images

**Required browsers:**
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### 7. Performance Monitoring

**Continuous monitoring during development:**

```javascript
// Start monitoring (logs every 5 seconds)
const stopMonitoring = window.performanceTests.monitor(5000)

// Stop monitoring when done
stopMonitoring()
```

### 8. Generate Performance Report

**Create a comprehensive performance report:**

```javascript
const report = window.performanceTests.generateReport()
console.log(JSON.stringify(report, null, 2))
```

This includes:
- All performance metrics
- Viewport dimensions
- User agent
- Connection information
- Motion preferences

## Lighthouse Testing

**Run Lighthouse audit:**

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Click "Analyze page load"

**Target scores:**
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

## Common Issues and Solutions

### Issue: High LCP (Largest Contentful Paint)

**Solutions:**
- Ensure hero images are preloaded
- Optimize image sizes
- Use CDN for static assets
- Enable compression

### Issue: High CLS (Cumulative Layout Shift)

**Solutions:**
- Add explicit width/height to images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS aspect-ratio

### Issue: Animations not respecting reduced motion

**Check:**
1. Verify CSS media query is present in globals.css
2. Check component uses `prefersReducedMotion()` utility
3. Test with system settings enabled

### Issue: Images not lazy loading

**Check:**
1. Verify `loading="lazy"` attribute is present
2. Check images are below the fold
3. Ensure IntersectionObserver is supported

## Performance Checklist

Before considering task complete, verify:

- [ ] All below-the-fold components are lazy loaded
- [ ] `prefers-reduced-motion` is respected for all animations
- [ ] All images use Next.js Image component with optimization
- [ ] Performance metrics are within target ranges (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)
- [ ] Tested in Chrome, Firefox, Safari, and Edge
- [ ] Tested at exact breakpoint widths (768px, 1200px)
- [ ] Lighthouse score ≥ 90 for all categories
- [ ] No console errors or warnings
- [ ] Smooth 60fps scrolling on all devices

## Additional Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Prefers Reduced Motion](https://web.dev/prefers-reduced-motion/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
