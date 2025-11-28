# Theme Variables Documentation

This document provides a comprehensive reference for all CSS variables available in the global theme system.

## Table of Contents

- [Brand Colors](#brand-colors)
- [Semantic Colors](#semantic-colors)
- [Neutral Palette](#neutral-palette)
- [Interactive States](#interactive-states)
- [Shadows](#shadows)
- [Gradients](#gradients)
- [Effects](#effects)
- [Theme Variants](#theme-variants)
- [Usage Examples](#usage-examples)

## Brand Colors

### Primary Color
The main brand color used for primary actions, links, and key UI elements.

```css
--color-primary: #6366f1;              /* Default primary color */
--color-primary-hover: #4f46e5;        /* Hover state */
--color-primary-active: #4338ca;       /* Active/pressed state */
--color-primary-foreground: #ffffff;   /* Text color on primary background */
```

**Usage:**
- Primary buttons
- Active navigation items
- Links and interactive elements
- Focus indicators

### Secondary Color
Supporting brand color for secondary actions and accents.

```css
--color-secondary: #8b5cf6;
--color-secondary-hover: #7c3aed;
--color-secondary-active: #6d28d9;
--color-secondary-foreground: #ffffff;
```

**Usage:**
- Secondary buttons
- Accent elements
- Decorative elements

## Semantic Colors

### Success
Indicates successful operations, positive states, or confirmations.

```css
--color-success: #10b981;
--color-success-hover: #059669;
--color-success-active: #047857;
--color-success-foreground: #ffffff;
```

**Usage:**
- Success messages
- Confirmation buttons
- Positive indicators
- Completed states

### Warning
Indicates caution, important information, or actions that need attention.

```css
--color-warning: #f59e0b;
--color-warning-hover: #d97706;
--color-warning-active: #b45309;
--color-warning-foreground: #ffffff;
```

**Usage:**
- Warning messages
- Caution indicators
- Important notices

### Danger
Indicates errors, destructive actions, or critical states.

```css
--color-danger: #ef4444;
--color-danger-hover: #dc2626;
--color-danger-active: #b91c1c;
--color-danger-foreground: #ffffff;
```

**Usage:**
- Error messages
- Delete buttons
- Critical warnings
- Failed states

### Info
Indicates informational content or neutral notifications.

```css
--color-info: #3b82f6;
--color-info-hover: #2563eb;
--color-info-active: #1d4ed8;
--color-info-foreground: #ffffff;
```

**Usage:**
- Info messages
- Help text
- Neutral notifications

## Neutral Palette

### Backgrounds

```css
--color-background: #ffffff;           /* Main page background */
--color-background-secondary: #fafafa; /* Secondary background areas */
--color-background-tertiary: #f5f5f5;  /* Tertiary background areas */
```

**Usage:**
- Page backgrounds
- Section backgrounds
- Card backgrounds

### Surfaces

```css
--color-surface: #ffffff;                      /* Default surface color */
--color-surface-elevated: #ffffff;             /* Elevated surfaces (modals, dropdowns) */
--color-surface-glass: rgba(255, 255, 255, 0.7); /* Glass morphism effect */
```

**Usage:**
- Cards
- Modals
- Dropdowns
- Popovers
- Glass effect components

### Text Colors

```css
--color-text-primary: #0B1A17;     /* Primary text color */
--color-text-secondary: #6B6F72;   /* Secondary text color */
--color-text-muted: #9ca3af;       /* Muted/subtle text */
--color-text-disabled: #d1d5db;    /* Disabled text */
```

**Usage:**
- Headings (primary)
- Body text (primary/secondary)
- Labels (secondary)
- Placeholder text (muted)
- Disabled form fields (disabled)

### Borders

```css
--color-border: #e5e7eb;               /* Default border color */
--color-border-hover: #d1d5db;         /* Border on hover */
--color-border-focus: var(--color-primary); /* Border on focus */
```

**Usage:**
- Card borders
- Input borders
- Dividers
- Table borders

## Interactive States

```css
--color-hover-overlay: rgba(0, 0, 0, 0.05);  /* Overlay for hover states */
--color-active-overlay: rgba(0, 0, 0, 0.1);  /* Overlay for active states */
--color-focus-ring: var(--color-primary);    /* Focus ring color */
--color-disabled-bg: #f3f4f6;                /* Disabled background */
--color-disabled-text: #9ca3af;              /* Disabled text */
```

**Usage:**
- Button hover effects
- Interactive element states
- Focus indicators
- Disabled states

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

**Usage:**
- Cards (sm, md)
- Dropdowns (lg)
- Modals (xl)
- Hero sections (2xl)

## Gradients

```css
--gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
--gradient-info: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

**Usage:**
- Primary buttons
- Hero sections
- Decorative elements
- Status indicators

## Effects

```css
--opacity-disabled: 0.5;    /* Opacity for disabled elements */
--opacity-hover: 0.9;       /* Opacity for hover states */
--backdrop-blur: 12px;      /* Blur amount for glass effects */
```

**Usage:**
- Disabled states
- Hover effects
- Glass morphism
- Overlays

## Theme Variants

### Dark Theme

Apply the dark theme by adding the `.dark` or `.theme-dark` class to the root element:

```html
<html class="dark">
```

**Overridden Variables:**
- All background colors → Dark shades
- All text colors → Light shades
- Borders → Darker borders
- Shadows → Stronger shadows

### Brand Themes

#### Brand Blue
```html
<html class="theme-brand-blue">
```
- Primary: Sky blue (#0ea5e9)
- Secondary: Cyan (#06b6d4)

#### Brand Purple
```html
<html class="theme-brand-purple">
```
- Primary: Purple (#a855f7)
- Secondary: Fuchsia (#d946ef)

#### Brand Green (Current)
```html
<html class="theme-brand-green">
```
- Primary: Green (#36B37E)
- Secondary: Emerald (#10b981)

#### Ocean (Example Custom)
```html
<html class="theme-ocean">
```
- Primary: Ocean blue (#0077be)
- Secondary: Aqua (#00a8cc)
- Background: Light blue tint

## Usage Examples

### Using Variables in CSS

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.my-button:hover {
  background-color: var(--color-primary-hover);
}

.my-button:active {
  background-color: var(--color-primary-active);
}

.my-button:disabled {
  background-color: var(--color-disabled-bg);
  color: var(--color-disabled-text);
  opacity: var(--opacity-disabled);
}
```

### Using Variables in Tailwind

```tsx
<button className="bg-primary hover:bg-primary-hover text-primary-foreground">
  Click me
</button>

<div className="bg-surface border border-border-default shadow-md">
  Card content
</div>

<p className="text-text-primary">
  Primary text
</p>

<p className="text-text-muted">
  Muted text
</p>
```

### Using Variables in Inline Styles

```tsx
<div style={{
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-lg)'
}}>
  Content
</div>
```

### Creating a Custom Theme

```css
/* In globals.css */
.theme-my-brand {
  --color-primary: #ff6b6b;
  --color-primary-hover: #ff5252;
  --color-primary-active: #ff3838;
  --color-secondary: #4ecdc4;
  --color-secondary-hover: #45b8b0;
  --color-secondary-active: #3ca39c;
  
  /* Override only the colors you want to change */
  /* Other variables will inherit from :root */
}
```

### Switching Themes Programmatically

```typescript
// React component
function ThemeSwitcher() {
  const switchTheme = (theme: string) => {
    const root = document.documentElement;
    // Remove existing theme classes
    root.className = root.className.replace(/theme-\w+/g, '');
    // Add new theme class
    if (theme !== 'light') {
      root.classList.add(`theme-${theme}`);
    }
  };

  return (
    <select onChange={(e) => switchTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="brand-blue">Brand Blue</option>
      <option value="brand-purple">Brand Purple</option>
      <option value="brand-green">Brand Green</option>
      <option value="ocean">Ocean</option>
    </select>
  );
}
```

## Naming Conventions

All theme variables follow a consistent naming pattern:

```
--{category}-{name}[-{state}]
```

**Categories:**
- `color-` - Color values
- `shadow-` - Shadow effects
- `gradient-` - Gradient definitions
- `opacity-` - Opacity values
- `space-` - Spacing values

**States:**
- `-hover` - Hover state
- `-active` - Active/pressed state
- `-focus` - Focus state
- `-disabled` - Disabled state

**Examples:**
- `--color-primary-hover`
- `--color-text-muted`
- `--shadow-lg`
- `--gradient-primary`

## Best Practices

1. **Always use variables** instead of hardcoded colors
2. **Provide fallbacks** for critical styles: `var(--color-primary, #6366f1)`
3. **Use semantic names** that describe purpose, not appearance
4. **Test with all themes** to ensure proper contrast and visibility
5. **Validate accessibility** - ensure WCAG 2.1 Level AA compliance
6. **Document custom themes** with clear naming and purpose

## Accessibility

All theme variants must meet WCAG 2.1 Level AA standards:

- **Normal text**: Minimum contrast ratio of 4.5:1
- **Large text**: Minimum contrast ratio of 3:1
- **UI components**: Minimum contrast ratio of 3:1

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to validate your custom themes.

## Migration Guide

### From Hardcoded Colors

**Before:**
```css
.button {
  background-color: #6366f1;
  color: #ffffff;
}
```

**After:**
```css
.button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}
```

### From Tailwind Hardcoded Classes

**Before:**
```tsx
<button className="bg-indigo-600 hover:bg-indigo-700 text-white">
```

**After:**
```tsx
<button className="bg-primary hover:bg-primary-hover text-primary-foreground">
```

## Support

For questions or issues with the theme system:
1. Check this documentation
2. Review the design document at `.kiro/specs/global-theme-system/design.md`
3. Check existing theme implementations in `globals.css`
