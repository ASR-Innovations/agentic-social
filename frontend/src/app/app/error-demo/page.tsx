'use client';

import { useState } from 'react';
import { PageSectionBoundary, CardBoundary, ComponentBoundary } from '@/components/ui/page-section-boundary';
import { SafeFadeIn, SafeScaleIn, SafeSlideIn } from '@/components/ui/safe-animated';
import { SafeImage, SafeAvatar } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { errorLogger } from '@/lib/error-logger';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Component that throws an error
function ErrorComponent() {
  throw new Error('This is a test error from ErrorComponent');
  return <div>This will never render</div>;
}

// Component that throws an error after a delay
function DelayedErrorComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Delayed error triggered');
  }

  return (
    <Button onClick={() => setShouldError(true)} variant="outline">
      Click to trigger error
    </Button>
  );
}

export default function ErrorDemoPage() {
  const [showError1, setShowError1] = useState(false);
  const [showError2, setShowError2] = useState(false);
  const [showError3, setShowError3] = useState(false);

  const handleLogError = () => {
    const testError = new Error('Manual test error');
    errorLogger.log(testError, 'medium', {
      source: 'error-demo-page',
      action: 'manual-log',
    });
    alert('Error logged! Check console.');
  };

  const handleDownloadLogs = () => {
    errorLogger.downloadLogs();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <SafeFadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Error Boundaries Demo
            </h1>
            <p className="text-gray-600">
              This page demonstrates error boundaries and fallback mechanisms.
            </p>
          </div>
        </SafeFadeIn>

        {/* Error Logging Controls */}
        <SafeScaleIn delay={0.1}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Error Logging</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleLogError} variant="outline">
                  Log Test Error
                </Button>
                <Button onClick={handleDownloadLogs} variant="outline">
                  Download Error Logs
                </Button>
                <Button
                  onClick={() => {
                    const logs = errorLogger.getLogs();
                    console.log('All logs:', logs);
                    alert(`Total logs: ${logs.length}. Check console for details.`);
                  }}
                  variant="outline"
                >
                  View Logs in Console
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Errors are automatically logged and can be exported for debugging.
              </p>
            </CardContent>
          </Card>
        </SafeScaleIn>

        {/* Page Section Boundary Demo */}
        <SafeSlideIn direction="left" delay={0.2}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                1. PageSectionBoundary Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Catches errors in major page sections with minimal inline fallback
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => setShowError1(!showError1)}
                  variant={showError1 ? 'destructive' : 'default'}
                >
                  {showError1 ? 'Hide' : 'Show'} Error
                </Button>
              </div>

              <PageSectionBoundary sectionName="demo section">
                {showError1 ? (
                  <ErrorComponent />
                ) : (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Section loaded successfully</p>
                        <p className="text-sm text-green-700">
                          This content is wrapped in a PageSectionBoundary
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </PageSectionBoundary>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Card Boundary Demo */}
        <SafeSlideIn direction="left" delay={0.3}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                2. CardBoundary Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Catches errors in card components with card-styled fallback
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => setShowError2(!showError2)}
                  variant={showError2 ? 'destructive' : 'default'}
                >
                  {showError2 ? 'Hide' : 'Show'} Error
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <CardBoundary title="Card 1">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">Normal card content</p>
                  </div>
                </CardBoundary>

                <CardBoundary title="Card 2">
                  {showError2 ? (
                    <ErrorComponent />
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">Normal card content</p>
                    </div>
                  )}
                </CardBoundary>

                <CardBoundary title="Card 3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">Normal card content</p>
                  </div>
                </CardBoundary>
              </div>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Component Boundary Demo */}
        <SafeSlideIn direction="left" delay={0.4}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                3. ComponentBoundary Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Minimal error boundary for small inline components
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={() => setShowError3(!showError3)}
                  variant={showError3 ? 'destructive' : 'default'}
                >
                  {showError3 ? 'Hide' : 'Show'} Error
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Status:</span>
                <ComponentBoundary fallback={<span className="text-red-600">Error</span>}>
                  {showError3 ? (
                    <ErrorComponent />
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </ComponentBoundary>
              </div>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Safe Image Demo */}
        <SafeSlideIn direction="left" delay={0.5}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                4. SafeImage Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Handles image loading errors with fallback UI
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Valid Image</p>
                  <SafeImage
                    src="https://via.placeholder.com/300"
                    alt="Valid placeholder"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Invalid Image</p>
                  <SafeImage
                    src="/invalid-image-url.jpg"
                    alt="Invalid image"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Custom Fallback</p>
                  <SafeImage
                    src="/another-invalid-url.jpg"
                    alt="Custom fallback"
                    className="w-full h-40 object-cover rounded-lg"
                    fallback={
                      <div className="w-full h-40 bg-purple-100 rounded-lg flex items-center justify-center">
                        <p className="text-purple-700 text-sm">Custom fallback</p>
                      </div>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Safe Avatar Demo */}
        <SafeSlideIn direction="left" delay={0.6}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                5. SafeAvatar Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Avatar with fallback to initials
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <SafeAvatar
                    src="/invalid-avatar.jpg"
                    alt="John Doe"
                    name="John Doe"
                    size="sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">Small</p>
                </div>
                <div className="text-center">
                  <SafeAvatar
                    src="/invalid-avatar.jpg"
                    alt="Jane Smith"
                    name="Jane Smith"
                    size="md"
                  />
                  <p className="text-xs text-gray-600 mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <SafeAvatar
                    src="/invalid-avatar.jpg"
                    alt="Bob Johnson"
                    name="Bob Johnson"
                    size="lg"
                  />
                  <p className="text-xs text-gray-600 mt-2">Large</p>
                </div>
                <div className="text-center">
                  <SafeAvatar
                    src="/invalid-avatar.jpg"
                    alt="Alice Williams"
                    name="Alice Williams"
                    size="xl"
                  />
                  <p className="text-xs text-gray-600 mt-2">Extra Large</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Safe Animation Demo */}
        <SafeSlideIn direction="left" delay={0.7}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                6. Safe Animation Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Animations with error handling and reduced motion support
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <SafeFadeIn delay={0}>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-900">Fade In</p>
                  </div>
                </SafeFadeIn>

                <SafeScaleIn delay={0.2}>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                    <p className="text-sm font-medium text-purple-900">Scale In</p>
                  </div>
                </SafeScaleIn>

                <SafeSlideIn direction="right" delay={0.4}>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-900">Slide In</p>
                  </div>
                </SafeSlideIn>
              </div>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Interactive Error Demo */}
        <SafeSlideIn direction="left" delay={0.8}>
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                7. Interactive Error Demo
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Trigger errors on demand to test error boundaries
              </p>
            </CardHeader>
            <CardContent>
              <PageSectionBoundary sectionName="interactive demo">
                <DelayedErrorComponent />
              </PageSectionBoundary>
            </CardContent>
          </Card>
        </SafeSlideIn>

        {/* Summary */}
        <SafeFadeIn delay={0.9}>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error Handling Summary
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>All major page sections are wrapped in error boundaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Animations gracefully degrade on errors or reduced motion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Images and assets have fallback UI when loading fails</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>All errors are logged for debugging and monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </SafeFadeIn>
      </div>
    </div>
  );
}
