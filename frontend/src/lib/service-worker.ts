/**
 * Service Worker registration and management utilities
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(
  config?: ServiceWorkerConfig
): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  // Only register in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Service worker registration skipped in development');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      {
        scope: '/',
      }
    );

    console.log('Service worker registered:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('New service worker available');
          config?.onUpdate?.(registration);
        }
      });
    });

    // Success callback
    config?.onSuccess?.(registration);

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    config?.onError?.(error as Error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service worker update triggered');
    }
  } catch (error) {
    console.error('Service worker update failed:', error);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('All caches cleared');

    // Also notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      });
    }
  } catch (error) {
    console.error('Cache clearing failed:', error);
  }
}

/**
 * Get cache storage estimate
 */
export async function getCacheStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      usage,
      quota,
      percentage: Math.round(percentage * 100) / 100,
    };
  } catch (error) {
    console.error('Storage estimate failed:', error);
    return null;
  }
}

/**
 * Check if service worker is active
 */
export function isServiceWorkerActive(): boolean {
  return (
    'serviceWorker' in navigator &&
    navigator.serviceWorker.controller !== null
  );
}

/**
 * Wait for service worker to be ready
 */
export async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Service worker ready check failed:', error);
    return null;
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaitingAndActivate(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SKIP_WAITING',
    });
  }
}

/**
 * Listen for service worker updates
 */
export function onServiceWorkerUpdate(
  callback: (registration: ServiceWorkerRegistration) => void
): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }

  const handleUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      callback(registration);
    }
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleUpdate);

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleUpdate);
  };
}
