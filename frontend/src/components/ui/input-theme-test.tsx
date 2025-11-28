'use client';

import React, { useState } from 'react';
import { Input } from './input';
import { Mail, Lock, User, Search } from 'lucide-react';

/**
 * Visual test component for Input with theme system
 * Tests all input states with CSS variables across different themes
 */
export function InputThemeTest() {
  const [theme, setTheme] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  const applyTheme = (themeClass: string) => {
    // Remove all theme classes
    const themes = ['theme-dark', 'theme-brand-blue', 'theme-brand-purple', 'theme-brand-green'];
    themes.forEach(t => document.documentElement.classList.remove(t));
    
    // Apply new theme if provided
    if (themeClass) {
      document.documentElement.classList.add(themeClass);
    }
    setTheme(themeClass);
  };

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Theme Switcher */}
        <div className="bg-surface p-6 rounded-xl border border-border-default">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Theme Switcher</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyTheme('')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === '' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-surface text-text-primary border-border-default hover:border-border-hover'
              }`}
            >
              Light (Default)
            </button>
            <button
              onClick={() => applyTheme('theme-dark')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'theme-dark' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-surface text-text-primary border-border-default hover:border-border-hover'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => applyTheme('theme-brand-blue')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'theme-brand-blue' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-surface text-text-primary border-border-default hover:border-border-hover'
              }`}
            >
              Brand Blue
            </button>
            <button
              onClick={() => applyTheme('theme-brand-purple')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'theme-brand-purple' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-surface text-text-primary border-border-default hover:border-border-hover'
              }`}
            >
              Brand Purple
            </button>
            <button
              onClick={() => applyTheme('theme-brand-green')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                theme === 'theme-brand-green' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-surface text-text-primary border-border-default hover:border-border-hover'
              }`}
            >
              Brand Green
            </button>
          </div>
        </div>

        {/* Input States Test */}
        <div className="bg-surface p-6 rounded-xl border border-border-default space-y-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Input States</h2>
          
          {/* Default State */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Default State</h3>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
            />
          </div>

          {/* Hover State (shown via description) */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Hover State</h3>
            <Input
              type="text"
              placeholder="Hover over this input"
              helperText="Hover to see border color change"
            />
          </div>

          {/* Focus State */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Focus State</h3>
            <Input
              type="text"
              placeholder="Click to focus"
              helperText="Focus ring uses theme primary color"
            />
          </div>

          {/* Error State */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Error State</h3>
            <Input
              type="password"
              placeholder="Enter password"
              error="Password must be at least 8 characters"
              icon={<Lock className="w-5 h-5" />}
            />
          </div>

          {/* Success State */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Success State</h3>
            <Input
              type="text"
              placeholder="Valid input"
              value="john@example.com"
              success
              icon={<Mail className="w-5 h-5" />}
            />
          </div>

          {/* Disabled State */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Disabled State</h3>
            <Input
              type="text"
              placeholder="Disabled input"
              value="Cannot edit this"
              disabled
              icon={<User className="w-5 h-5" />}
            />
          </div>

          {/* With Label */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">With Label</h3>
            <Input
              type="text"
              label="Search"
              placeholder="Search for something..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              helperText="Helper text uses theme text colors"
            />
          </div>

          {/* Icon Right */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Icon on Right</h3>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              iconPosition="right"
            />
          </div>
        </div>

        {/* CSS Variables Reference */}
        <div className="bg-surface p-6 rounded-xl border border-border-default">
          <h2 className="text-xl font-semibold text-text-primary mb-4">CSS Variables Used</h2>
          <div className="space-y-2 text-sm text-text-secondary font-mono">
            <p>• Background: <code className="text-text-primary">var(--color-surface)</code></p>
            <p>• Text: <code className="text-text-primary">var(--color-text-primary)</code></p>
            <p>• Placeholder: <code className="text-text-primary">var(--color-text-muted)</code></p>
            <p>• Border: <code className="text-text-primary">var(--color-border-default)</code></p>
            <p>• Border Hover: <code className="text-text-primary">var(--color-border-hover)</code></p>
            <p>• Focus Ring: <code className="text-text-primary">var(--color-focus-ring)</code></p>
            <p>• Error: <code className="text-text-primary">var(--color-danger)</code></p>
            <p>• Success: <code className="text-text-primary">var(--color-success)</code></p>
            <p>• Disabled BG: <code className="text-text-primary">var(--color-disabled-bg)</code></p>
            <p>• Disabled Text: <code className="text-text-primary">var(--color-disabled-text)</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
