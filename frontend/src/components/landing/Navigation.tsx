'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';
import { smoothScrollTo } from '@/lib/performance';

export function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Channels', href: '#channels' },
    { label: 'Resources', href: '#resources' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const targetId = href.replace('#', '');
    smoothScrollTo(targetId, 80); // 80px offset for navigation height
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full bg-cream/95 backdrop-blur-sm border-b border-gray-200 z-50 transition-all duration-150 ease-in-out ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-text-primary">
              SocialAI
            </span>
          </div>

          {/* Center Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-text-muted hover:text-brand-green transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-text-muted hover:text-brand-green hover:bg-brand-green/5 border border-gray-300 rounded-full px-6"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/signup')}
              className="bg-brand-green hover:bg-brand-green/90 text-white px-6 py-2.5 rounded-full shadow-sm transition-all"
            >
              Get started for free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-cream/98 backdrop-blur-sm">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block py-3 text-base font-medium text-text-muted hover:text-brand-green transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="w-full justify-center text-text-muted border border-gray-300 rounded-full"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="w-full justify-center bg-brand-green hover:bg-brand-green/90 text-white rounded-full"
              >
                Get started for free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
