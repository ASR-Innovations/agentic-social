# Error Boundaries and Fallbacks Guide

This guide explains how to use the error boundary components and fallback mechanisms in the application.

## Components Overview

### 1. ErrorBoundary
General-purpose error boundary for catching React errors.

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary 
  fallback={<CustomFallback />}
  onError={(error, errorInfo) => console.error(error)}
  showDetails={process.env.NODE_ENV === 'development'}
>
  <YourComponent />
</ErrorBoundary>
```

### 2. PageSectionBoundary
Specialized error boundary for major page sections with minimal inline fallback.

```tsx
import { PageSectionBoundary } from '@/components/ui/page-section-boundary';

<PageSectionBoundary sectionName="Analytics Dashboard">
  <AnalyticsDashboard />
</PageSectionBoundary>
```

### 3. CardBoundary
Error boundary for card components with card-styled fallback.

```tsx
import { CardBoundary } from '@/components/ui/page-section-boundary';

<CardBoundary title="Recent Activity">
  <RecentActivityCard />
</CardBoundary>
```

### 4. ComponentBoundary
Minimal error boundary for small UI components.

```tsx
import { ComponentBoundary } from '@/components/ui/page-section-boundary';

<ComponentBoundary fallback={<span>N/A</span>}>
  <SmallWidget />
</ComponentBoundary>
```

## Animation Error Handling

### SafeAnimatedComponent
Wrapper for Framer Motion animations that handles errors and respects reduced motion.

```tsx
import { SafeAnimatedComponent } from '@/components/ui/safe-animated';

<SafeAnimatedComponent
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  fallbackClassName="my-fallback-class"
>
  <YourContent />
</SafeAnimatedComponent>
```

### Pre-configured Animation Components

```tsx
import { SafeFadeIn, SafeScaleIn, SafeSlideIn } from '@/components/ui/safe-animated';

// Fade in animation
<SafeFadeIn delay={0.2} duration={0.5}>
  <Content />
</SafeFadeIn>

// Scale in animation
<SafeScaleIn delay={0.1}>
  <Card />
</SafeScaleIn>

// Slide in animation
<SafeSlideIn direction="left" delay={0.3}>
  <Panel />
</SafeSlideIn>
```

## Image Error Handling

### SafeImage
Standard image component with error handling.

```tsx
import { SafeImage } from '@/components/ui/safe-image';

<SafeImage
  src="/path/to/image.jpg"
  alt="Description"
  fallback={<CustomPlaceholder />}
  showErrorIcon={true}
  className="w-full h-64 object-cover rounded-lg"
/>
```

### SafeNextImage
Next.js Image component with error handling.

```tsx
import { SafeNextImage } from '@/components/ui/safe-image';

<SafeNextImage
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  fallback={<CustomPlaceholder />}
/>
```

### SafeAvatar
Avatar component with fallback to initials.

```tsx
import { SafeAvatar } from '@/components/ui/safe-image';

<SafeAvatar
  src="/path/to/avatar.jpg"
  alt="User Name"
  name="John Doe"
  size="md"
/>
```

## Error Logging

### Using the Error Logger

```tsx
import { errorLogger, useErrorLogger } from '@/lib/error-logger';

// In a component
const logger = useErrorLogger();

try {
  // Some operation
} catch (error) {
  logger.log(error, 'high', { context: 'user-action' });
}

// Log specific error types
logger.logAnimationError(error, 'fadeIn');
logger.logAssetError('/image.jpg', 'image');
logger.logNetworkError(error, '/api/posts', 'GET');
```

### Viewing Logs

```tsx
import { errorLogger } from '@/lib/error-logger';

// Get all logs
const logs = errorLogger.getLogs();

// Get logs by severity
const criticalLogs = errorLogger.getLogsBySeverity('critical');

// Export logs
const jsonLogs = errorLogger.exportLogs();

// Download logs as file
errorLogger.downloadLogs();
```

## Best Practices

### 1. Wrap Major Page Sections

```tsx
export default function DashboardPage() {
  return (
    <div className="page-container">
      <PageSectionBoundary sectionName="metrics">
        <MetricsSection />
      </PageSectionBoundary>

      <PageSectionBoundary sectionName="charts">
        <ChartsSection />
      </PageSectionBoundary>

      <PageSectionBoundary sectionName="activity">
        <ActivitySection />
      </PageSectionBoundary>
    </div>
  );
}
```

### 2. Use Appropriate Boundaries

- **PageSectionBoundary**: For major page sections (dashboard widgets, analytics panels)
- **CardBoundary**: For individual cards within a section
- **ComponentBoundary**: For small, inline components
- **ErrorBoundary**: For custom error handling needs

### 3. Handle Animations Safely

```tsx
// Instead of:
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  <Content />
</motion.div>

// Use:
<SafeFadeIn>
  <Content />
</SafeFadeIn>
```

### 4. Handle Images Safely

```tsx
// Instead of:
<img src={userAvatar} alt="User" />

// Use:
<SafeAvatar src={userAvatar} alt="User" name={userName} />
```

### 5. Log Errors Appropriately

```tsx
const handleSubmit = async () => {
  try {
    await submitForm(data);
  } catch (error) {
    // Log with appropriate severity
    errorLogger.log(error, 'high', {
      action: 'form-submission',
      formType: 'contact',
    });
    
    // Show user-friendly message
    toast.error('Failed to submit form. Please try again.');
  }
};
```

## Example: Complete Page with Error Handling

```tsx
'use client';

import { PageSectionBoundary, CardBoundary } from '@/components/ui/page-section-boundary';
import { SafeFadeIn } from '@/components/ui/safe-animated';
import { SafeImage } from '@/components/ui/safe-image';
import { errorLogger } from '@/lib/error-logger';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SafeFadeIn>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      </SafeFadeIn>

      {/* Metrics Section */}
      <PageSectionBoundary sectionName="metrics">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {metrics.map((metric) => (
            <CardBoundary key={metric.id} title={metric.title}>
              <MetricCard data={metric} />
            </CardBoundary>
          ))}
        </div>
      </PageSectionBoundary>

      {/* Charts Section */}
      <PageSectionBoundary sectionName="charts">
        <div className="grid grid-cols-2 gap-6">
          <CardBoundary title="Performance Chart">
            <PerformanceChart />
          </CardBoundary>
          
          <CardBoundary title="Activity Chart">
            <ActivityChart />
          </CardBoundary>
        </div>
      </PageSectionBoundary>

      {/* Recent Posts with Images */}
      <PageSectionBoundary sectionName="recent posts">
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post) => (
              <CardBoundary key={post.id} title="Post">
                <SafeImage
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h3 className="mt-2 font-medium">{post.title}</h3>
              </CardBoundary>
            ))}
          </div>
        </div>
      </PageSectionBoundary>
    </div>
  );
}
```

## Testing Error Boundaries

### Trigger Errors in Development

```tsx
// Create a component that throws an error
function ErrorTrigger() {
  throw new Error('Test error');
  return <div>This will never render</div>;
}

// Wrap it in an error boundary to test
<ErrorBoundary showDetails={true}>
  <ErrorTrigger />
</ErrorBoundary>
```

### Test Animation Errors

```tsx
// Test with invalid animation props
<SafeAnimatedComponent
  initial={{ invalidProp: 'test' }}
  animate={{ opacity: 1 }}
>
  <Content />
</SafeAnimatedComponent>
```

### Test Image Errors

```tsx
// Test with invalid image URL
<SafeImage
  src="/invalid-image-url.jpg"
  alt="Test"
  showErrorIcon={true}
/>
```

## Global Error Handler

The `ErrorProvider` component sets up global error handlers automatically. It's already included in the main providers, so you don't need to add it manually.

```tsx
// Already set up in providers.tsx
<ErrorProvider>
  <YourApp />
</ErrorProvider>
```

This handles:
- Unhandled promise rejections
- Global JavaScript errors
- Resource loading errors (images, scripts, styles)

All errors are automatically logged to the error logger and can be sent to error tracking services like Sentry.
