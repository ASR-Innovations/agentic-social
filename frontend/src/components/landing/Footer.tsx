'use client';

import { FooterProps } from '@/lib/landing-types';
import { Bot, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer({ columns, socialLinks }: FooterProps) {
  const socialIcons: Record<string, React.ReactNode> = {
    Twitter: <Twitter className="w-4 h-4" />,
    LinkedIn: <Linkedin className="w-4 h-4" />,
    GitHub: <Github className="w-4 h-4" />,
  };

  return (
    <footer
      data-testid="footer"
      className="bg-gray-50 border-t border-gray-100 py-16 px-6 lg:px-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                SocialAI
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered social media management for modern teams.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-all"
                  aria-label={`Follow us on ${link.label}`}
                >
                  {socialIcons[link.label] || link.label[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index} data-testid="footer-section">
              <h4 className="text-gray-900 font-medium text-sm mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
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
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SocialAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
