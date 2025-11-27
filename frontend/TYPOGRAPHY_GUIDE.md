# Premium Professional Typography System

## Overview
Your application now uses a premium, multi-tier font system featuring the most modern and professional typefaces used by leading tech companies.

## Font Families

### Premium Fonts
- **Sans-serif (Body)**: Plus Jakarta Sans - Modern, elegant, highly readable
- **Display (Headings)**: Sora - Contemporary, geometric, perfect for impact
- **Heading (Alternative)**: Outfit - Clean, versatile, professional
- **Monospace (Code)**: JetBrains Mono - Developer-friendly for code

### Why These Fonts?
- **Plus Jakarta Sans**: Used by modern SaaS companies, excellent readability
- **Sora**: Featured in premium design systems, perfect for hero sections
- **Outfit**: Versatile and professional, great for UI elements
- **JetBrains Mono**: Industry-standard for developers

### Usage in Code
```jsx
// Default body text (Plus Jakarta Sans)
<p className="font-sans">Body text</p>
<p className="font-body">Body text alternative</p>

// Display headings (Sora)
<h1 className="font-display">Main Heading</h1>

// Alternative headings (Outfit)
<h2 className="font-heading">Section Heading</h2>

// Code blocks (JetBrains Mono)
<code className="font-mono">const x = 10;</code>
```

## Typography Scale

### Heading Classes
```jsx
// Extra Large - Hero sections
<h1 className="heading-xl">Hero Title</h1>

// Large - Page titles
<h2 className="heading-lg">Page Title</h2>

// Medium - Section headings
<h3 className="heading-md">Section Heading</h3>

// Small - Subsection headings
<h4 className="heading-sm">Subsection</h4>
```

### Body Text Classes
```jsx
// Large body - Lead paragraphs
<p className="body-lg">Introduction text...</p>

// Medium body - Standard text
<p className="body-md">Regular content...</p>

// Small body - Fine print
<p className="body-sm">Additional details...</p>
```

### Label Classes
```jsx
// Large labels - Form labels, buttons
<label className="label-lg">Username</label>

// Medium labels - Small UI elements
<span className="label-md">Badge</span>
```

## Typography Features

### Professional Enhancements
- ✅ **Antialiasing**: Smooth font rendering on all displays
- ✅ **Optical Sizing**: Automatic size-based adjustments
- ✅ **Kerning**: Professional letter spacing
- ✅ **Ligatures**: Contextual character combinations
- ✅ **Text Balance**: Prevents orphaned words in headings
- ✅ **Text Pretty**: Optimizes paragraph line breaks

### Responsive Typography
All heading and body classes automatically scale across breakpoints:
- Mobile: Base size
- Tablet (sm): +1 size
- Desktop (lg): +2 sizes

## Examples

### Landing Page Hero
```jsx
<section>
  <h1 className="heading-xl text-balance">
    Transform Your Social Media Strategy
  </h1>
  <p className="body-lg text-pretty text-muted-foreground mt-6">
    AI-powered tools to create, schedule, and optimize your content
  </p>
</section>
```

### Card Component
```jsx
<div className="card">
  <h3 className="heading-sm mb-2">Feature Title</h3>
  <p className="body-md text-muted-foreground">
    Description of the feature goes here
  </p>
</div>
```

### Form Labels
```jsx
<div className="form-group">
  <label className="label-lg text-foreground">
    Email Address
  </label>
  <input type="email" className="form-input" />
</div>
```

## Best Practices

### Do's ✅
- Use `font-display` for main headings and hero sections
- Use `font-sans` for body text and UI elements
- Apply `text-balance` to headings to prevent orphans
- Apply `text-pretty` to paragraphs for better line breaks
- Use semantic HTML tags (h1-h6, p, etc.) with utility classes

### Don'ts ❌
- Don't mix too many font families on one page
- Don't use display fonts for body text
- Don't override letter-spacing without good reason
- Don't use all caps for long text (use `label-*` classes instead)

## Color Combinations

### High Contrast (Accessibility)
```jsx
<h1 className="heading-xl text-foreground">Title</h1>
<p className="body-md text-foreground">Body</p>
```

### Muted/Secondary
```jsx
<h2 className="heading-lg text-muted-foreground">Subtitle</h2>
<p className="body-md text-muted-foreground">Description</p>
```

### Branded
```jsx
<h1 className="heading-xl text-gradient-primary">Branded Title</h1>
```

## Performance Notes

- All fonts use `display=swap` for optimal loading
- Font files are cached by Google Fonts CDN
- Fallback fonts ensure text is always readable
- System fonts used as fallbacks for instant rendering

## Migration Guide

### Old Pattern
```jsx
<h1 className="text-4xl font-bold">Title</h1>
```

### New Pattern
```jsx
<h1 className="heading-lg">Title</h1>
```

This provides better consistency, responsiveness, and professional typography automatically.
