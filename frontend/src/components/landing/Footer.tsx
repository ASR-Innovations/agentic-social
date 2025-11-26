'use client';

import { FooterProps } from '@/lib/landing-types';
import { Sparkles } from 'lucide-react';

export function Footer({ columns, socialLinks }: FooterProps) {
  return (
    <footer className="bg-footer-dark text-gray-400 py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SocialAI</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm mb-4">
              Your social media workspace
            </p>
            <p className="text-sm text-gray-500">
              AI-powered social media management platform helping brands create, schedule, and optimize content effortlessly.
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                {column.title}
              </h4>
              <ul className="space-y-4 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SocialAI. All rights reserved.
          </p>
          <div className="flex gap-8">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
