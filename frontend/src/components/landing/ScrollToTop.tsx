'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { smoothScrollToTop } from '@/lib/performance';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={smoothScrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 bg-brand-green text-white rounded-full shadow-buffer hover:shadow-buffer-lg hover:scale-110 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
