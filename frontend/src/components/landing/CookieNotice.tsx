'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-buffer-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-bold text-text-primary">
            Cookie Notice
          </h3>
          <button
            onClick={handleDismiss}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-text-muted leading-relaxed mb-4">
          We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white rounded-full"
          >
            Accept
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 border-gray-300 rounded-full"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
