/**
 * TabGroup Component
 * Pill-style tabs with smooth transitions and count badges
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export function TabGroup({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}: TabGroupProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (variant === 'underline') {
    return (
      <div className={cn('border-b border-gray-200', className)}>
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'relative py-4 px-1 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900',
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold',
                        isActive
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.3, ease: 'easeInOut' }
                    }
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Pills variant
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            className={cn(
              'relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.3, ease: 'easeInOut' }
                }
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
