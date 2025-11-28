# Bundle Optimization Guide

## Potentially Unused Dependencies

Based on the codebase analysis, the following dependencies may not be actively used and could be removed to reduce bundle size:

### Potentially Unused:
- `@heroicons/react` - Using lucide-react instead
- `react-beautiful-dnd` - No drag-and-drop implementation found
- `react-calendar` - Calendar view not implemented
- `react-color` - Color picker not implemented
- `react-cropper` - Image cropping not implemented
- `react-dropzone` - File upload not fully implemented
- `react-markdown` - Markdown rendering not used
- `react-resizable-panels` - Resizable panels not used
- `react-select` - Using native selects
- `react-speech-recognition` - Voice features not implemented
- `react-syntax-highlighter` - Code highlighting not used
- `react-virtualized` - Virtualization not implemented
- `recharts` - Charts are placeholders
- `embla-carousel-react` - Carousel not implemented
- `cmdk` - Command palette not implemented
- `dompurify` - Sanitization not actively used
- `date-fns` - Using native Date methods
- `next-pwa` - PWA not configured
- `next-themes` - Theme switching not implemented
- `swr` - Using @tanstack/react-query instead

### To Remove:
Run the following command to remove unused dependencies:

```bash
cd frontend
npm uninstall @heroicons/react react-beautiful-dnd react-calendar react-color react-cropper react-markdown react-resizable-panels react-select react-speech-recognition react-syntax-highlighter react-virtualized embla-carousel-react cmdk dompurify date-fns next-pwa next-themes swr
```

### Keep for Future Use:
- `react-dropzone` - Will be used for media upload
- `recharts` - Will be used for analytics charts
- `socket.io-client` - For real-time features

## Bundle Size Optimization Checklist

- [x] Enable SWC minification
- [x] Configure image optimization
- [x] Add code splitting with React.lazy
- [x] Implement progressive enhancement for animations
- [x] Add proper memoization utilities
- [x] Configure webpack optimizations
- [x] Add caching headers
- [ ] Remove unused dependencies
- [ ] Implement tree shaking for icon libraries
- [ ] Add bundle analyzer to CI/CD

## Performance Targets

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Total Bundle Size: < 300KB (gzipped)

## Monitoring

Use the following commands to monitor bundle size:

```bash
# Analyze bundle
npm run analyze

# Build for production
npm run build:production

# Check bundle size
du -sh .next/static
```
