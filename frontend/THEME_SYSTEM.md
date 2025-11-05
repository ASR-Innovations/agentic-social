# Theme System Documentation

## Overview

The AI Social Media Platform now includes a comprehensive theme system with support for:
- **Light Mode**: Clean, bright interface optimized for daylight viewing
- **Dark Mode**: Eye-friendly dark interface for low-light environments
- **System Mode**: Automatically matches your operating system's theme preference

## Features

### 1. Theme Toggle Component
Located at `src/components/theme-toggle.tsx`, this component provides an easy-to-use dropdown menu for switching between themes.

**Usage:**
```tsx
import { ThemeToggle } from '@/components/theme-toggle';

// In your component
<ThemeToggle />
```

### 2. Theme Provider
The theme system uses `next-themes` for seamless theme management with:
- Automatic system theme detection
- Persistent theme selection (saved in localStorage)
- No flash of unstyled content on page load
- SSR-safe implementation

### 3. CSS Variables
Theme colors are defined using CSS custom properties in `src/styles/globals.css`:

**Light Mode Variables:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}
```

**Dark Mode Variables:**
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... more variables */
}
```

### 4. Tailwind Dark Mode
The project uses Tailwind's class-based dark mode strategy:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  // ...
}
```

## Implementation Guide

### Adding Dark Mode to Components

Use Tailwind's `dark:` prefix to specify dark mode styles:

```tsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  <h1 className="text-gray-900 dark:text-white">Hello World</h1>
  <p className="text-gray-600 dark:text-gray-400">Description text</p>
</div>
```

### Common Patterns

#### 1. Background Gradients
```tsx
<div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
```

#### 2. Text Colors
```tsx
// Headings
<h1 className="text-gray-900 dark:text-white">

// Body text
<p className="text-gray-600 dark:text-gray-400">

// Muted text
<span className="text-gray-500 dark:text-gray-500">
```

#### 3. Borders
```tsx
<div className="border border-gray-200 dark:border-gray-800">
```

#### 4. Hover States
```tsx
<button className="hover:bg-gray-100 dark:hover:bg-gray-800">
```

#### 5. Glass Morphism
```tsx
<div className="glass-card">
  {/* Automatically adapts to theme */}
</div>
```

### Glass Components

Pre-built glass morphism components that work in both themes:

- `.glass` - Basic glass effect
- `.glass-card` - Card with glass effect
- `.glass-button` - Button with glass effect
- `.glass-input` - Input with glass effect

### Gradient Classes

Theme-aware gradient utilities:

```tsx
// Primary gradient
<div className="gradient-primary">

// Secondary gradient
<div className="gradient-secondary">

// Success, Warning, Danger
<div className="gradient-success">
<div className="gradient-warning">
<div className="gradient-danger">
```

## Pages Updated

All pages have been updated to support dark mode:

1. **Landing Page** (`/`)
   - Theme toggle in navigation
   - Adaptive backgrounds and text
   - Professional appearance in both modes

2. **Login Page** (`/login`)
   - Theme toggle in top-right corner
   - Form elements adapt to theme
   - Consistent branding

3. **App Layout** (`/app/*`)
   - Theme toggle in header
   - Sidebar adapts to theme
   - All internal pages inherit theme

4. **Dashboard** (`/app/dashboard`)
   - Cards and widgets adapt automatically
   - Charts and visualizations theme-aware

5. **404 Page** (`/not-found`)
   - Consistent theme support
   - Adaptive error messaging

## Programmatic Theme Access

### Using the Theme Hook

```tsx
'use client';

import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, setTheme, systemTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>System theme: {systemTheme}</p>
      
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Theme Detection

```tsx
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div>
      {resolvedTheme === 'dark' ? (
        <DarkModeContent />
      ) : (
        <LightModeContent />
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Use Dark Mode Classes
Never rely on JavaScript for theme-dependent styling. Use Tailwind's `dark:` prefix:

```tsx
// ✅ Good
<div className="bg-white dark:bg-slate-900">

// ❌ Bad
<div className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>
```

### 2. Test Both Themes
Always test your components in both light and dark modes to ensure:
- Text is readable
- Contrast ratios meet accessibility standards
- Interactive elements are visible
- Hover states work correctly

### 3. Use Semantic Colors
Prefer semantic color names over specific shades:

```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Less flexible
<div className="bg-white text-black dark:bg-slate-900 dark:text-white">
```

### 4. Avoid Hardcoded Colors
Use CSS variables and Tailwind classes instead of hardcoded hex values:

```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">

// ❌ Bad
<div style={{ backgroundColor: '#6366f1', color: '#ffffff' }}>
```

### 5. Handle Mounted State
For components that depend on theme, handle the mounted state to avoid hydration mismatches:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <Skeleton />; // or null
}
```

## Accessibility

The theme system maintains WCAG 2.1 AA compliance:

- **Contrast Ratios**: All text meets minimum contrast requirements
- **Focus Indicators**: Visible in both themes
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Compatible with system high contrast modes

## Troubleshooting

### Theme Not Persisting
Ensure the ThemeProvider is wrapping your app in `layout.tsx`:

```tsx
import { Providers } from '@/components/providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Flash of Unstyled Content
Add `suppressHydrationWarning` to the `<html>` tag:

```tsx
<html lang="en" suppressHydrationWarning>
```

### Theme Not Applying
Check that:
1. The `dark` class is being added to the `<html>` element
2. Tailwind's `darkMode: ['class']` is configured
3. CSS variables are properly defined

## Future Enhancements

Potential improvements to consider:

1. **Custom Theme Colors**: Allow users to customize primary/accent colors
2. **High Contrast Mode**: Additional theme for accessibility
3. **Theme Scheduling**: Auto-switch based on time of day
4. **Per-Page Themes**: Different themes for different sections
5. **Theme Presets**: Multiple pre-configured color schemes

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
