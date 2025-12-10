/**
 * Modal Component
 * Accessible modal dialog with animations, focus trap, and keyboard navigation
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useFocusTrap, useFocusRestore, useId, usePrefersReducedMotion } from '@/lib/accessibility';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
}: ModalProps) {
  const titleId = useId('modal-title');
  const descriptionId = useId('modal-description');
  const containerRef = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusRestore();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Save focus when modal opens
  React.useEffect(() => {
    if (isOpen) {
      saveFocus();
    } else {
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const backdropAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };

  const contentAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { duration: 0.3, ease: 'easeOut' },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            {...backdropAnimation}
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={containerRef as React.RefObject<HTMLDivElement>}
            {...contentAnimation}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              'relative bg-surface rounded-2xl shadow-xl w-full overflow-hidden',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border-default">
              <div className="flex-1">
                <h2
                  id={titleId}
                  className="text-2xl font-bold text-text-primary"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="ml-4 hover:bg-[var(--color-hover-overlay)] rounded-lg flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </Button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border-default bg-bg-secondary">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Confirmation Dialog Component
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

// Alert Dialog Component
export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  actionLabel?: string;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  variant = 'info',
  actionLabel = 'OK',
}: AlertDialogProps) {
  const variantConfig = {
    info: {
      icon: '💡',
      gradient: 'from-info/10 to-info/20',
      iconColor: 'text-info',
    },
    success: {
      icon: '✓',
      gradient: 'from-success/10 to-success/20',
      iconColor: 'text-success',
    },
    warning: {
      icon: '⚠',
      gradient: 'from-warning/10 to-warning/20',
      iconColor: 'text-warning',
    },
    error: {
      icon: '✕',
      gradient: 'from-danger/10 to-danger/20',
      iconColor: 'text-danger',
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br',
            config.gradient
          )}
        >
          <span className={cn('text-3xl', config.iconColor)}>
            {config.icon}
          </span>
        </div>
        <p className="text-text-primary mb-6">{description}</p>
        <Button onClick={onClose} className="w-full">
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}
