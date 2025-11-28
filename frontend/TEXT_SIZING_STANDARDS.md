# Text Sizing Standards

## Typography Scale

### Page Titles
- **Main page heading**: `text-2xl font-semibold` (consistent across all pages)
- **Page subtitle**: `text-sm text-gray-500`

### Section Headings
- **Section title**: `text-lg font-medium` or `text-base font-medium`
- **Card title**: `text-base font-medium`
- **Card description**: `text-sm text-gray-500`

### Body Text
- **Primary body**: `text-sm` (14px)
- **Secondary/meta text**: `text-xs` (12px)
- **Tiny text**: `text-[10px]` (10px) - use sparingly

### Interactive Elements
- **Button text**: `text-sm` for desktop, maintain touch targets with padding
- **Badge text**: `text-xs`
- **Input text**: `text-sm`
- **Link text**: `text-sm`

### Stats & Metrics
- **Large numbers**: `text-3xl font-light` or `text-2xl font-semibold`
- **Metric labels**: `text-xs font-medium uppercase tracking-wide`
- **Metric changes**: `text-xs font-medium`

## Issues Found & Fixed

### Dashboard Page
- ✅ Title already correct: `text-2xl`
- ✅ Stats values: `text-xl` → keeping as is (appropriate for dashboard)
- ✅ Card text: mostly `text-xs` and `text-sm` (good)

### AI Hub Page
- ❌ Title: `text-2xl` (correct)
- ⚠️ Modal headings: `text-2xl font-light` → should be `text-xl font-medium`
- ✅ Card text: `text-sm` and `text-xs` (good)

### Content Page
- ✅ Title: `text-2xl` (correct)
- ✅ Body text: `text-xs` and `text-sm` (good)

### Analytics Page
- ✅ Title: `text-2xl` (correct)
- ✅ Metrics: `text-3xl font-light` (good for large numbers)
- ✅ Body text: `text-sm` and `text-xs` (good)

### Inbox Page
- ✅ Title: `text-2xl` (correct)
- ✅ Message text: `text-xs` and `text-sm` (good)

### Listening Page
- ✅ Title: `text-2xl` (correct)
- ✅ Body text: `text-xs` and `text-sm` (good)

### Media Page
- ✅ Title: `text-2xl` (correct)
- ✅ Body text: `text-sm` and `text-xs` (good)

### Settings Page
- ✅ Title: `text-2xl` (correct)
- ✅ Section headings: `text-xl font-medium` (good)
- ✅ Body text: `text-sm` (good)

### Team Page
- ❌ Title: `text-4xl font-light` → should be `text-2xl font-semibold`
- ✅ Stats: `text-3xl font-light` (good for large numbers)
- ✅ Body text: `text-sm` and `text-xs` (good)

## Recommendations

1. **Standardize all page titles to `text-2xl font-semibold`**
2. **Use `text-sm` for primary body text**
3. **Use `text-xs` for secondary/meta information**
4. **Use `text-3xl font-light` for large stat numbers**
5. **Use `text-base font-medium` for card/section titles**
6. **Maintain consistent badge sizing at `text-xs`**
