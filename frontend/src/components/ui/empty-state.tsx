/**
 * EmptyState Component
 * Displays helpful, visually appealing empty states with illustrations
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from './card';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/accessibility';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  iconGradient?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  iconGradient = 'from-indigo-100 to-purple-100',
  children,
}: EmptyStateProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' },
      };

  const iconAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' },
      };

  return (
    <motion.div {...containerAnimation}>
      <Card variant="glass" className={cn('overflow-hidden', className)}>
        <div className="py-16 px-6">
          <div className="text-center max-w-md mx-auto">
            <motion.div
              {...iconAnimation}
              className={cn(
                'w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg',
                iconGradient
              )}
            >
              <div className="text-indigo-600">{icon}</div>
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {title}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {description}
            </p>

            {(action || secondaryAction) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {action && (
                  <Button
                    onClick={action.onClick}
                    icon={action.icon}
                    size="lg"
                  >
                    {action.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    onClick={secondaryAction.onClick}
                    variant="outline"
                    size="lg"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}

            {children && (
              <div className="mt-6">
                {children}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
