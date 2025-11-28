/**
 * Tests for useScrollAnimation hook
 */

import { renderHook } from '@testing-library/react';
import { useScrollAnimation, useScrollStagger, useParallax, useProgressiveReveal } from './useScrollAnimation';
import * as accessibility from '@/lib/accessibility';

// Mock the accessibility module
jest.mock('@/lib/accessibility', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

// Mock Framer Motion's useInView
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useInView: jest.fn(() => true),
  useScroll: jest.fn(() => ({ scrollYProgress: { get: () => 0 } })),
  useTransform: jest.fn(() => ({ get: () => 0 })),
}));

describe('useScrollAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(true);
    expect(result.current.shouldAnimate).toBe(true);
    expect(result.current.animationState).toBe('visible');
  });

  it('should respect reduced motion preference', () => {
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.animationState).toBe('visible'); // Always visible when reduced motion
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useScrollAnimation({
        once: false,
        amount: 0.5,
        margin: '100px',
        disabled: false,
      })
    );

    expect(result.current.ref).toBeDefined();
  });

  it('should disable animations when disabled option is true', () => {
    const { result } = renderHook(() =>
      useScrollAnimation({ disabled: true })
    );

    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.animationState).toBe('visible');
  });
});

describe('useScrollStagger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('should return correct state for staggered animations', () => {
    const { result } = renderHook(() => useScrollStagger());

    expect(result.current.ref).toBeDefined();
    expect(result.current.shouldAnimate).toBe(true);
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useScrollStagger({
        once: false,
        amount: 0.3,
      })
    );

    expect(result.current.ref).toBeDefined();
  });
});

describe('useParallax', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('should return correct parallax state', () => {
    const { result } = renderHook(() => useParallax(0.5));

    expect(result.current.ref).toBeDefined();
    expect(result.current.speed).toBe(0.5);
    expect(result.current.shouldAnimate).toBe(true);
  });

  it('should disable parallax when reduced motion is preferred', () => {
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useParallax(0.5));

    expect(result.current.speed).toBe(0);
    expect(result.current.shouldAnimate).toBe(false);
  });
});

describe('useProgressiveReveal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (accessibility.usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
  });

  it('should return correct state for progressive reveal', () => {
    const { result } = renderHook(() => useProgressiveReveal());

    expect(result.current.ref).toBeDefined();
    expect(result.current.shouldAnimate).toBe(true);
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({
        once: false,
        amount: 0.2,
      })
    );

    expect(result.current.ref).toBeDefined();
  });
});
