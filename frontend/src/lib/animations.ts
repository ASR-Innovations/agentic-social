/**
 * Animation Utilities - Framer Motion Presets
 * Consistent animation configurations for the entire application
 */

import { Variants, Transition } from 'framer-motion';

// Standard easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
} as const;

// Standard durations
export const durations = {
  fast: 0.15,
  base: 0.2,
  medium: 0.3,
  slow: 0.5,
} as const;

// Page Transition Animations
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Stagger Container Animation
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Stagger Item Animation
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
};

// Fade In Animation
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Fade In Up Animation
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
};

// Scale In Animation
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Slide In From Right
export const slideInRight: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Slide In From Left
export const slideInLeft: Variants = {
  initial: {
    x: '-100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Card Hover Animation
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
};

// Button Tap Animation
export const buttonTap = {
  whileTap: {
    scale: 0.98,
  },
  whileHover: {
    scale: 1.02,
  },
  transition: {
    duration: durations.base,
    ease: easings.easeInOut,
  },
};

// Modal Animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Sidebar Animations
export const sidebarAnimation = {
  open: {
    width: 280,
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeInOut,
    },
  },
  closed: {
    width: 0,
    opacity: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeInOut,
    },
  },
};

// Dropdown Animation
export const dropdownAnimation: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Toast Notification Animation
export const toastAnimation: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.medium,
      ease: easings.springBouncy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
};

// Skeleton Loading Animation
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Scroll Reveal Animation (for use with useInView)
export const scrollReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
};

// Number Counter Animation
export const counterAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: durations.medium, ease: easings.easeOut },
};

// Utility function to create custom stagger animations
export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  childDelay: number = 0
): Variants => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childDelay,
    },
  },
});

// Utility function to create custom fade animations
export const createFadeAnimation = (
  duration: number = durations.medium,
  delay: number = 0
): Variants => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration,
      delay,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.base,
      ease: easings.easeIn,
    },
  },
});

// Utility function to create custom slide animations
export const createSlideAnimation = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20,
  duration: number = durations.medium
): Variants => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'down' || direction === 'right' ? distance : -distance;

  return {
    initial: {
      opacity: 0,
      [axis]: value,
    },
    animate: {
      opacity: 1,
      [axis]: 0,
      transition: {
        duration,
        ease: easings.easeOut,
      },
    },
    exit: {
      opacity: 0,
      [axis]: value,
      transition: {
        duration: durations.base,
        ease: easings.easeIn,
      },
    },
  };
};

// Scroll-triggered animations with progressive reveal
export const scrollFadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

export const scrollFadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

export const scrollFadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

export const scrollFadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

export const scrollFadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

export const scrollScaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
};

// Staggered scroll reveal for lists
export const scrollStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const scrollStaggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
};

// Parallax effect variants
export const parallaxSlow: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -20,
    transition: {
      duration: 0.8,
      ease: easings.easeOut,
    },
  },
};

export const parallaxMedium: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -40,
    transition: {
      duration: 0.8,
      ease: easings.easeOut,
    },
  },
};

export const parallaxFast: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -60,
    transition: {
      duration: 0.8,
      ease: easings.easeOut,
    },
  },
};

// Utility function to create custom scroll animations
export const createScrollAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade',
  distance: number = 50,
  duration: number = durations.slow
): Variants => {
  if (direction === 'fade') {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration, ease: easings.easeOut },
      },
    };
  }

  if (direction === 'scale') {
    return {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration, ease: easings.easeOut },
      },
    };
  }

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'down' || direction === 'right' ? distance : -distance;

  return {
    hidden: {
      opacity: 0,
      [axis]: value,
    },
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: {
        duration,
        ease: easings.easeOut,
      },
    },
  };
};

// Export all animations
export const animations = {
  pageTransition,
  staggerContainer,
  staggerItem,
  fadeIn,
  fadeInUp,
  scaleIn,
  slideInRight,
  slideInLeft,
  cardHover,
  buttonTap,
  modalBackdrop,
  modalContent,
  sidebarAnimation,
  dropdownAnimation,
  toastAnimation,
  skeletonPulse,
  scrollReveal,
  scrollFadeIn,
  scrollFadeInUp,
  scrollFadeInDown,
  scrollFadeInLeft,
  scrollFadeInRight,
  scrollScaleIn,
  scrollStaggerContainer,
  scrollStaggerItem,
  parallaxSlow,
  parallaxMedium,
  parallaxFast,
  counterAnimation,
  createStaggerAnimation,
  createFadeAnimation,
  createSlideAnimation,
  createScrollAnimation,
} as const;

export default animations;
