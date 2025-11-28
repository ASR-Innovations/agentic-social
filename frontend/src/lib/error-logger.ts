/**
 * Error logging utility for tracking and reporting errors
 */

export interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLogData[] = [];
  private maxLogs = 100;

  /**
   * Log an error with context
   */
  log(
    error: Error,
    severity: ErrorLogData['severity'] = 'medium',
    context?: Record<string, any>
  ) {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity,
      context,
    };

    // Add to in-memory logs
    this.logs.push(errorData);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorLogger]', errorData);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(errorData);
    }
  }

  /**
   * Log a React component error
   */
  logComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName?: string
  ) {
    this.log(error, 'high', {
      componentName,
      componentStack: errorInfo.componentStack,
    });
  }

  /**
   * Log an animation error
   */
  logAnimationError(error: Error, animationName?: string) {
    this.log(error, 'low', {
      type: 'animation',
      animationName,
    });
  }

  /**
   * Log an asset loading error
   */
  logAssetError(assetUrl: string, assetType: 'image' | 'font' | 'script' | 'style') {
    const error = new Error(`Failed to load ${assetType}: ${assetUrl}`);
    this.log(error, 'medium', {
      type: 'asset',
      assetType,
      assetUrl,
    });
  }

  /**
   * Log a network error
   */
  logNetworkError(error: Error, endpoint?: string, method?: string) {
    this.log(error, 'high', {
      type: 'network',
      endpoint,
      method,
    });
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogData[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorLogData['severity']): ErrorLogData[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Send error to tracking service (e.g., Sentry, LogRocket)
   */
  private sendToService(errorData: ErrorLogData) {
    // TODO: Implement actual error tracking service integration
    // Example with Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(new Error(errorData.message), {
    //     level: errorData.severity,
    //     extra: errorData.context,
    //   });
    // }

    // For now, we'll just log to console
    console.error('[ErrorLogger] Would send to service:', errorData);
  }

  /**
   * Export logs as JSON for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as a file
   */
  downloadLogs() {
    if (typeof window === 'undefined') return;

    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Hook for using error logger in components
 */
export function useErrorLogger() {
  return errorLogger;
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      'high',
      {
        type: 'unhandledRejection',
        reason: event.reason,
      }
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    // Don't log script loading errors from browser extensions
    if (event.filename?.includes('chrome-extension://')) {
      return;
    }

    errorLogger.log(
      new Error(event.message),
      'high',
      {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Handle resource loading errors
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        errorLogger.logAssetError((target as HTMLImageElement).src, 'image');
      } else if (target.tagName === 'SCRIPT') {
        errorLogger.logAssetError((target as HTMLScriptElement).src, 'script');
      } else if (target.tagName === 'LINK') {
        errorLogger.logAssetError((target as HTMLLinkElement).href, 'style');
      }
    },
    true // Use capture phase to catch resource errors
  );
}
