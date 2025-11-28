# Typography System with Theme Variables

This document describes how the typography system uses CSS variables for theming.

## Overview

All typography elements (headings, paragraphs, labels) now use CSS variables for text colors, ensuring they automatically adapt to theme changes.

## CSS Variables Used

The typography system uses the following CSS variables:

- `--color-text-primary`: Primary text color (headings, body text)
- `--color-text-secondary`: Secondary text color (labels, small text)
- `--color-text-muted`: Muted text color (hints, placeholders)
- `--color-text-disabled`: Disabled text color

## Typography Elements

### Headings (h1-h6)

All heading elements automatically use `--color-text-primary`:

```html
<h1>This heading uses var(--color-text-primary)</h1>
<h2>This heading uses var(--color-text-primary)</h2>
<h3>This heading uses var(--color-text-primary)</h3>
```

### Paragraphs

Paragraph elements use `--color-text-primary`:

```html
<p>This paragraph uses var(--color-text-primary)</p>
```

### Utility Classes

#### Heading Classes

```html
<div class="heading-xl">Extra large heading with primary text color</div>
<div class="heading-lg">Large heading with primary text color</div>
<div class="heading-md">Medium heading with primary text color</div>
<div class="heading-sm">Small heading with primary text color</div>
```

#### Body Classes

```html
<div class="body-lg">Large body text with primary color</div>
<div class="body-md">Medium body text with primary color</div>
<div class="body-sm">Small body text with secondary color</div>
```

#### Label Classes

```html
<div class="label-lg">LARGE LABEL with secondary color</div>
<div class="label-md">MEDIUM LABEL with secondary color</div>
```

#### Text Color Utilities

```html
<p class="text-theme-primary">Primary text color</p>
<p class="text-theme-secondary">Secondary text color</p>
<p class="text-theme-muted">Muted text color</p>
<p class="text-theme-disabled">Disabled text color</p>
```

### Special Elements

#### Lead Text

```html
<p class="lead">This is lead text using secondary color</p>
```

#### Small and Tiny Text

```html
<p class="small">Small text using secondary color</p>
<p class="tiny">Tiny text using muted color</p>
```

#### Code and Pre

```html
<code>Inline code with theme background and text colors</code>
<pre>Code block with theme background and text colors</pre>
```

#### Blockquote

```html
<blockquote>
  Quote text using secondary color with primary border
</blockquote>
```

## Tailwind Utilities

You can also use Tailwind's text color utilities that reference CSS variables:

```html
<p class="text-text-primary">Uses var(--color-text-primary)</p>
<p class="text-text-secondary">Uses var(--color-text-secondary)</p>
<p class="text-text-muted">Uses var(--color-text-muted)</p>
<p class="text-text-disabled">Uses var(--color-text-disabled)</p>
```

## Theme Adaptation

When you switch themes (e.g., from light to dark), all typography automatically updates:

```javascript
// Switch to dark theme
document.documentElement.classList.add('theme-dark');

// All text colors automatically update:
// - Primary text: #0B1A17 → #f1f5f9
// - Secondary text: #6B6F72 → #cbd5e1
// - Muted text: #9ca3af → #94a3b8
// - Disabled text: #d1d5db → #64748b
```

## Migration from Hardcoded Colors

### Before (Hardcoded)

```html
<h1 class="text-gray-900">Heading</h1>
<p class="text-gray-600">Body text</p>
<span class="text-gray-400">Muted text</span>
```

### After (Theme Variables)

```html
<h1>Heading</h1> <!-- Automatically uses --color-text-primary -->
<p>Body text</p> <!-- Automatically uses --color-text-primary -->
<span class="text-theme-muted">Muted text</span> <!-- Uses --color-text-muted -->
```

Or with Tailwind utilities:

```html
<h1 class="text-text-primary">Heading</h1>
<p class="text-text-primary">Body text</p>
<span class="text-text-muted">Muted text</span>
```

## Best Practices

1. **Use semantic HTML elements**: Let `<h1>`, `<h2>`, `<p>` etc. inherit theme colors automatically
2. **Use utility classes for specific needs**: Use `.text-theme-*` or Tailwind's `text-text-*` utilities when you need specific text colors
3. **Avoid hardcoded colors**: Don't use `text-gray-900`, `text-black`, etc. - use theme variables instead
4. **Test with different themes**: Verify your typography looks good in light, dark, and brand themes

## Examples

### Card with Typography

```html
<div class="card">
  <h3>Card Title</h3> <!-- Uses --color-text-primary -->
  <p class="text-theme-secondary">Card description</p>
  <span class="text-theme-muted">Additional info</span>
</div>
```

### Form with Labels

```html
<form>
  <label class="label-md">Email Address</label>
  <input type="email" />
  <span class="text-theme-muted">We'll never share your email</span>
</form>
```

### Hero Section

```html
<section>
  <h1 class="heading-xl">Welcome to Our Platform</h1>
  <p class="lead">Build amazing things with our tools</p>
  <p class="body-lg">Get started today and see the difference</p>
</section>
```
