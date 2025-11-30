# Global Theme System Specification

## Overview

This specification defines a comprehensive CSS variable-based theming system for the AI Social Media Platform. The system centralizes all color definitions, enabling easy customization of the entire platform's appearance by modifying a single set of CSS variables.

## What This Achieves

✅ **Centralized Color Management**: All colors defined in one place (globals.css)
✅ **Easy Theme Switching**: Change entire platform colors by applying a CSS class
✅ **Multiple Theme Support**: Light, dark, and custom brand themes
✅ **No Code Changes Required**: Theme changes don't require recompilation
✅ **Consistent Styling**: All components automatically use theme colors
✅ **Accessibility Built-in**: Contrast validation and WCAG compliance
✅ **Developer-Friendly**: Clear naming conventions and utility classes

## Quick Start

### Changing Platform Colors

Once implemented, you can change the entire platform's color scheme by:

1. **Modifying CSS Variables** in `frontend/src/styles/globals.css`:
```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  /* ... other variables */
}
```

2. **Applying a Theme Class** to switch themes at runtime:
```typescript
document.documentElement.classList.add('theme-dark');
// or
document.documentElement.classList.add('theme-brand-blue');
```

3. **Creating Custom Themes** by defining new theme classes:
```css
.theme-my-brand {
  --color-primary: #ff6b6b;
  --color-secondary: #4ecdc4;
  /* Override only the colors you want to change */
}
```

## File Structure

```
.kiro/specs/global-theme-system/
├── README.md           # This file - overview and quick start
├── requirements.md     # Detailed requirements and acceptance criteria
├── design.md          # Technical design and architecture
└── tasks.md           # Implementation tasks and checklist
```

## Key Features

### 1. CSS Variable System
- Comprehensive set of color tokens for all UI elements
- Semantic naming (primary, secondary, success, warning, danger, info)
- State variants (hover, active, focus, disabled)
- Effect variables (shadows, gradients, opacity)

### 2. Theme Variants
- **Light Theme**: Default clean, professional appearance
- **Dark Theme**: Dark mode with proper contrast
- **Brand Themes**: Pre-built color schemes (blue, purple, green)
- **Custom Themes**: Easy to create your own

### 3. Component Integration
- All UI components use theme variables
- Buttons, cards, inputs, typography automatically themed
- No hardcoded colors in component code
- Consistent appearance across the platform

### 4. Developer Tools
- Tailwind utilities that reference CSS variables
- ThemeSwitcher component for runtime switching
- Theme validation and error handling
- Comprehensive documentation

## Implementation Status

To start implementing this spec:

1. Open `.kiro/specs/global-theme-system/tasks.md`
2. Click "Start task" next to task 1
3. Follow the implementation plan step by step

The tasks are organized in phases:
- **Phase 1**: CSS variable foundation (Tasks 1-3)
- **Phase 2**: Component refactoring (Tasks 4-10)
- **Phase 3**: Theme management (Tasks 11-12)
- **Phase 4**: Documentation and testing (Tasks 13-15)

## Benefits

### For Administrators
- Change platform colors in minutes, not hours
- Support multiple brands or tenants
- Easy rebranding without developer involvement
- Visual consistency guaranteed

### For Developers
- No more hunting for hardcoded colors
- Clear, semantic variable names
- Automatic theme support in all components
- Reduced CSS maintenance

### For Users
- Consistent visual experience
- Dark mode support
- Accessible color contrasts
- Smooth theme transitions

## Example Usage

### Before (Hardcoded Colors)
```tsx
<button className="bg-gray-900 hover:bg-gray-800 text-white">
  Click me
</button>
```

### After (Theme Variables)
```tsx
<button className="bg-primary hover:bg-primary-hover text-primary-foreground">
  Click me
</button>
```

Now changing `--color-primary` updates all buttons automatically!

## Next Steps

1. **Review the Requirements**: Read `requirements.md` to understand what we're building
2. **Study the Design**: Read `design.md` to understand the architecture
3. **Start Implementation**: Follow `tasks.md` to build the system
4. **Test Thoroughly**: Use property-based tests to ensure correctness

## Questions?

If you have questions about:
- **Requirements**: Check `requirements.md` for detailed acceptance criteria
- **Architecture**: Check `design.md` for technical details
- **Implementation**: Check `tasks.md` for step-by-step instructions
- **Usage**: This README provides quick start examples

## Theme Examples

### Creating a Custom Theme

```css
/* In globals.css */
.theme-ocean {
  --color-primary: #0077be;
  --color-primary-hover: #005a8f;
  --color-secondary: #00a8cc;
  --color-secondary-hover: #007a99;
  --color-success: #00d9a3;
  --color-background: #f0f8ff;
}
```

### Switching Themes Programmatically

```typescript
// In your React component
function MyThemeSwitcher() {
  const switchTheme = (themeName: string) => {
    document.documentElement.className = 
      document.documentElement.className.replace(/theme-\w+/g, '');
    document.documentElement.classList.add(`theme-${themeName}`);
  };
  
  return (
    <select onChange={(e) => switchTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="brand-blue">Brand Blue</option>
      <option value="ocean">Ocean</option>
    </select>
  );
}
```

## Accessibility

All theme variants must meet WCAG 2.1 Level AA standards:
- Text contrast ratio: minimum 4.5:1
- Large text contrast ratio: minimum 3:1
- UI component contrast ratio: minimum 3:1

The design includes automatic contrast validation to ensure accessibility.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (requires polyfill)

CSS custom properties are supported in all modern browsers.
