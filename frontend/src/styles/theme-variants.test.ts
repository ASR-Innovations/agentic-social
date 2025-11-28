/**
 * Tests for theme variant override behavior
 * Validates Requirements: 5.2, 5.3
 */

describe('Theme Variant Override Behavior', () => {
  let testElement: HTMLDivElement;
  let styleElement: HTMLStyleElement;

  beforeEach(() => {
    // Create a test element
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    // Inject CSS variables for testing
    styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --color-primary: #6366f1;
        --color-primary-hover: #4f46e5;
        --color-primary-active: #4338ca;
        --color-primary-foreground: #ffffff;
        --color-secondary: #8b5cf6;
        --color-secondary-hover: #7c3aed;
        --color-secondary-active: #6d28d9;
        --color-secondary-foreground: #ffffff;
        --color-success: #10b981;
        --color-success-hover: #059669;
        --color-success-active: #047857;
        --color-success-foreground: #ffffff;
        --color-warning: #f59e0b;
        --color-warning-hover: #d97706;
        --color-warning-active: #b45309;
        --color-warning-foreground: #ffffff;
        --color-danger: #ef4444;
        --color-danger-hover: #dc2626;
        --color-danger-active: #b91c1c;
        --color-danger-foreground: #ffffff;
        --color-info: #3b82f6;
        --color-info-hover: #2563eb;
        --color-info-active: #1d4ed8;
        --color-info-foreground: #ffffff;
        --color-background: #ffffff;
        --color-background-secondary: #fafafa;
        --color-background-tertiary: #f5f5f5;
        --color-surface: #ffffff;
        --color-surface-elevated: #ffffff;
        --color-surface-glass: rgba(255, 255, 255, 0.7);
        --color-text-primary: #0B1A17;
        --color-text-secondary: #6B6F72;
        --color-text-muted: #9ca3af;
        --color-text-disabled: #d1d5db;
        --color-border: #e5e7eb;
        --color-border-hover: #d1d5db;
        --color-border-focus: var(--color-primary);
        --color-hover-overlay: rgba(0, 0, 0, 0.05);
        --color-active-overlay: rgba(0, 0, 0, 0.1);
        --color-focus-ring: var(--color-primary);
        --color-disabled-bg: #f3f4f6;
        --color-disabled-text: #9ca3af;
        --space-1: 8px;
        --space-2: 16px;
        --space-3: 24px;
        --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
        --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        --gradient-info: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      
      .theme-dark {
        --color-primary: #818cf8;
        --color-primary-hover: #a5b4fc;
        --color-primary-active: #c7d2fe;
        --color-primary-foreground: #0f172a;
        --color-secondary: #a78bfa;
        --color-secondary-hover: #c4b5fd;
        --color-secondary-active: #ddd6fe;
        --color-secondary-foreground: #0f172a;
        --color-success: #34d399;
        --color-success-hover: #6ee7b7;
        --color-success-active: #a7f3d0;
        --color-success-foreground: #0f172a;
        --color-warning: #fbbf24;
        --color-warning-hover: #fcd34d;
        --color-warning-active: #fde68a;
        --color-warning-foreground: #0f172a;
        --color-danger: #f87171;
        --color-danger-hover: #fca5a5;
        --color-danger-active: #fecaca;
        --color-danger-foreground: #0f172a;
        --color-info: #60a5fa;
        --color-info-hover: #93c5fd;
        --color-info-active: #bfdbfe;
        --color-info-foreground: #0f172a;
        --color-background: #0f172a;
        --color-background-secondary: #1e293b;
        --color-background-tertiary: #334155;
        --color-surface: #1e293b;
        --color-surface-elevated: #334155;
        --color-surface-glass: rgba(30, 41, 59, 0.7);
        --color-text-primary: #f1f5f9;
        --color-text-secondary: #cbd5e1;
        --color-text-muted: #94a3b8;
        --color-text-disabled: #64748b;
        --color-border: #334155;
        --color-border-hover: #475569;
        --color-border-focus: var(--color-primary);
        --color-hover-overlay: rgba(255, 255, 255, 0.05);
        --color-active-overlay: rgba(255, 255, 255, 0.1);
        --color-focus-ring: var(--color-primary);
        --color-disabled-bg: #1e293b;
        --color-disabled-text: #64748b;
        --gradient-primary: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
        --gradient-success: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        --gradient-warning: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        --gradient-danger: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
        --gradient-info: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      }
      
      .theme-brand-blue {
        --color-primary: #0ea5e9;
        --color-primary-hover: #0284c7;
        --color-primary-active: #0369a1;
        --color-primary-foreground: #ffffff;
        --color-secondary: #06b6d4;
        --color-secondary-hover: #0891b2;
        --color-secondary-active: #0e7490;
        --color-secondary-foreground: #ffffff;
        --color-border-focus: #0ea5e9;
        --color-focus-ring: #0ea5e9;
        --gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      }
      
      .theme-brand-purple {
        --color-primary: #a855f7;
        --color-primary-hover: #9333ea;
        --color-primary-active: #7e22ce;
        --color-primary-foreground: #ffffff;
        --color-secondary: #d946ef;
        --color-secondary-hover: #c026d3;
        --color-secondary-active: #a21caf;
        --color-secondary-foreground: #ffffff;
        --color-border-focus: #a855f7;
        --color-focus-ring: #a855f7;
        --gradient-primary: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
      }
      
      .theme-brand-green {
        --color-primary: #36B37E;
        --color-primary-hover: #2a9d6f;
        --color-primary-active: #1e8760;
        --color-primary-foreground: #ffffff;
        --color-secondary: #10b981;
        --color-secondary-hover: #059669;
        --color-secondary-active: #047857;
        --color-secondary-foreground: #ffffff;
        --color-border-focus: #36B37E;
        --color-focus-ring: #36B37E;
        --gradient-primary: linear-gradient(135deg, #36B37E 0%, #10b981 100%);
      }
    `;
    document.head.appendChild(styleElement);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(testElement);
    document.head.removeChild(styleElement);
    document.documentElement.className = '';
  });

  describe('Dark Theme Override', () => {
    it('should override default color values when .theme-dark is applied', () => {
      // Apply dark theme
      document.documentElement.classList.add('theme-dark');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Verify background colors are overridden
      const bgColor = styles.getPropertyValue('--color-background').trim();
      expect(bgColor).toBe('#0f172a');
      
      // Verify text colors are overridden
      const textColor = styles.getPropertyValue('--color-text-primary').trim();
      expect(textColor).toBe('#f1f5f9');
      
      // Verify primary color is overridden for dark mode
      const primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#818cf8');
    });

    it('should preserve non-overridden variables in dark theme', () => {
      document.documentElement.classList.add('theme-dark');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Verify spacing variables are preserved (not overridden in dark theme)
      const space1 = styles.getPropertyValue('--space-1').trim();
      expect(space1).toBe('8px');
      
      const space2 = styles.getPropertyValue('--space-2').trim();
      expect(space2).toBe('16px');
    });
  });

  describe('Brand Color Theme Overrides', () => {
    it('should override primary colors when .theme-brand-blue is applied', () => {
      document.documentElement.classList.add('theme-brand-blue');
      
      const styles = getComputedStyle(document.documentElement);
      
      const primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#0ea5e9');
      
      const primaryHover = styles.getPropertyValue('--color-primary-hover').trim();
      expect(primaryHover).toBe('#0284c7');
      
      const secondaryColor = styles.getPropertyValue('--color-secondary').trim();
      expect(secondaryColor).toBe('#06b6d4');
    });

    it('should override primary colors when .theme-brand-purple is applied', () => {
      document.documentElement.classList.add('theme-brand-purple');
      
      const styles = getComputedStyle(document.documentElement);
      
      const primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#a855f7');
      
      const primaryHover = styles.getPropertyValue('--color-primary-hover').trim();
      expect(primaryHover).toBe('#9333ea');
      
      const secondaryColor = styles.getPropertyValue('--color-secondary').trim();
      expect(secondaryColor).toBe('#d946ef');
    });

    it('should override primary colors when .theme-brand-green is applied', () => {
      document.documentElement.classList.add('theme-brand-green');
      
      const styles = getComputedStyle(document.documentElement);
      
      const primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#36B37E');
      
      const primaryHover = styles.getPropertyValue('--color-primary-hover').trim();
      expect(primaryHover).toBe('#2a9d6f');
      
      const secondaryColor = styles.getPropertyValue('--color-secondary').trim();
      expect(secondaryColor).toBe('#10b981');
    });
  });

  describe('Partial Override Behavior', () => {
    it('should preserve semantic colors when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-blue');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Semantic colors should remain unchanged
      const successColor = styles.getPropertyValue('--color-success').trim();
      expect(successColor).toBe('#10b981');
      
      const warningColor = styles.getPropertyValue('--color-warning').trim();
      expect(warningColor).toBe('#f59e0b');
      
      const dangerColor = styles.getPropertyValue('--color-danger').trim();
      expect(dangerColor).toBe('#ef4444');
    });

    it('should preserve background colors when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-purple');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Background colors should remain unchanged
      const bgColor = styles.getPropertyValue('--color-background').trim();
      expect(bgColor).toBe('#ffffff');
      
      const bgSecondary = styles.getPropertyValue('--color-background-secondary').trim();
      expect(bgSecondary).toBe('#fafafa');
    });

    it('should preserve text colors when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-green');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Text colors should remain unchanged
      const textPrimary = styles.getPropertyValue('--color-text-primary').trim();
      expect(textPrimary).toBe('#0B1A17');
      
      const textSecondary = styles.getPropertyValue('--color-text-secondary').trim();
      expect(textSecondary).toBe('#6B6F72');
    });
  });

  describe('Theme Switching', () => {
    it('should correctly switch between themes', () => {
      // Start with default theme
      let styles = getComputedStyle(document.documentElement);
      let primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#6366f1');
      
      // Switch to brand blue
      document.documentElement.classList.add('theme-brand-blue');
      styles = getComputedStyle(document.documentElement);
      primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#0ea5e9');
      
      // Switch to brand purple
      document.documentElement.classList.remove('theme-brand-blue');
      document.documentElement.classList.add('theme-brand-purple');
      styles = getComputedStyle(document.documentElement);
      primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#a855f7');
      
      // Switch back to default
      document.documentElement.classList.remove('theme-brand-purple');
      styles = getComputedStyle(document.documentElement);
      primaryColor = styles.getPropertyValue('--color-primary').trim();
      expect(primaryColor).toBe('#6366f1');
    });

    it('should handle multiple theme classes correctly (last one wins)', () => {
      // Apply multiple theme classes
      document.documentElement.classList.add('theme-brand-blue');
      document.documentElement.classList.add('theme-brand-purple');
      
      const styles = getComputedStyle(document.documentElement);
      
      // The last applied theme should win (CSS cascade)
      const primaryColor = styles.getPropertyValue('--color-primary').trim();
      // In CSS, the last defined rule wins, so purple should override blue
      expect(primaryColor).toBe('#a855f7');
    });
  });

  describe('Gradient Override', () => {
    it('should override gradient when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-blue');
      
      const styles = getComputedStyle(document.documentElement);
      
      const gradient = styles.getPropertyValue('--gradient-primary').trim();
      expect(gradient).toContain('#0ea5e9');
      expect(gradient).toContain('#06b6d4');
    });

    it('should preserve other gradients when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-purple');
      
      const styles = getComputedStyle(document.documentElement);
      
      // Success gradient should remain unchanged
      const successGradient = styles.getPropertyValue('--gradient-success').trim();
      expect(successGradient).toContain('#10b981');
      expect(successGradient).toContain('#059669');
    });
  });

  describe('Focus Ring Override', () => {
    it('should override focus ring color when brand theme is applied', () => {
      document.documentElement.classList.add('theme-brand-blue');
      
      const styles = getComputedStyle(document.documentElement);
      
      const focusRing = styles.getPropertyValue('--color-focus-ring').trim();
      expect(focusRing).toBe('#0ea5e9');
      
      const borderFocus = styles.getPropertyValue('--color-border-focus').trim();
      expect(borderFocus).toBe('#0ea5e9');
    });
  });
});
