# Centralized Background Colors Guide

**How to Change All Page Backgrounds from One Place**

---

## ✅ What Was Done

All pages and the sidebar now use **centralized CSS variables** for background colors. You can change the background color of the entire app by modifying just **3 lines** in one file!

---

## 🎯 How to Change Background Colors

### Step 1: Open the Global CSS File

Open: `frontend/src/styles/globals.css`

### Step 2: Find the Page Background Variables

Look for lines **82-85**:

```css
/* ===== Page-Specific Backgrounds (Change these to update all pages!) ===== */
--color-page-background: #f9fafb;        /* Main page background (gray-50) */
--color-card-background: #ffffff;         /* Card/content backgrounds (white) */
--color-sidebar-background: #ffffff;      /* Sidebar background */
```

### Step 3: Change the Color Values

Simply change the hex color values:

```css
/* Example 1: Darker background */
--color-page-background: #f3f4f6;        /* gray-100 */

/* Example 2: Light green tint */
--color-page-background: #f0fdf4;        /* green-50 */

/* Example 3: Cream/beige background */
--color-page-background: #faf5f0;        /* custom cream */

/* Example 4: Dark mode style */
--color-page-background: #1f2937;        /* gray-800 */
--color-card-background: #374151;         /* gray-700 */
--color-sidebar-background: #111827;      /* gray-900 */
```

### Step 4: Save and Refresh

1. Save the file
2. The dev server will auto-reload
3. If changes don't appear, hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## 📋 What Each Variable Controls

| Variable | Controls | Current Pages Affected |
|----------|----------|----------------------|
| `--color-page-background` | Main page background | Dashboard, Analytics, Content, Media, Team, Settings, Listening, Inbox, AI Hub |
| `--color-card-background` | Card backgrounds | All Card components across the app |
| `--color-sidebar-background` | Sidebar background | App sidebar navigation |

---

## 🎨 Example Color Combinations

### Minimalistic (Current)
```css
--color-page-background: #f9fafb;        /* Very light gray */
--color-card-background: #ffffff;         /* Pure white */
--color-sidebar-background: #ffffff;      /* Pure white */
```

### Warm & Professional
```css
--color-page-background: #faf5f0;        /* Warm cream */
--color-card-background: #ffffff;         /* White */
--color-sidebar-background: #f8f5f1;      /* Light cream */
```

### Dark Mode
```css
--color-page-background: #0f172a;        /* Dark blue-gray */
--color-card-background: #1e293b;         /* Lighter dark */
--color-sidebar-background: #0c1222;      /* Darker blue */
```

### Green Theme (Matching your primary color)
```css
--color-page-background: #f0fdf4;        /* green-50 */
--color-card-background: #ffffff;         /* White */
--color-sidebar-background: #ecfdf5;      /* green-50 lighter */
```

### High Contrast
```css
--color-page-background: #f3f4f6;        /* gray-100 */
--color-card-background: #ffffff;         /* White */
--color-sidebar-background: #e5e7eb;      /* gray-200 */
```

---

## 🛠️ Using Utility Classes in Code

All pages now use these utility classes:

```tsx
// Page background
<div className="min-h-screen bg-page">

// Card background
<Card className="bg-card">

// Sidebar background
<aside className="bg-sidebar">
```

**Benefits:**
- ✅ Change one CSS variable → Updates entire app
- ✅ Consistent across all pages
- ✅ Easy to experiment with colors
- ✅ No need to edit multiple files

---

## 🎯 Quick Color Reference

### Tailwind Gray Shades (For Reference)
```css
gray-50:  #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb
gray-300: #d1d5db
gray-400: #9ca3af
gray-500: #6b7280
gray-600: #4b5563
gray-700: #374151
gray-800: #1f2937
gray-900: #111827
```

### Green Shades (Matching Your Theme)
```css
green-50:   #f0fdf4
green-100:  #dcfce7
green-200:  #bbf7d0
emerald-50: #ecfdf5
emerald-100:#d1fae5
```

### Neutral/Warm Shades
```css
slate-50:  #f8fafc
stone-50:  #fafaf9
zinc-50:   #fafafa
neutral-50:#fafafa
```

---

## 💡 Pro Tips

### 1. **Use Color Pickers**
- macOS: Digital Color Meter (built-in)
- Online: [Coolors.co](https://coolors.co), [Adobe Color](https://color.adobe.com)
- Get hex codes from websites you like!

### 2. **Test Contrast**
Make sure text is readable on your chosen background:
- Dark text needs light backgrounds
- Light text needs dark backgrounds
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 3. **Experiment Safely**
```css
/* Comment out the current value and test new ones */
--color-page-background: #f9fafb;  /* Original */
/* --color-page-background: #f0fdf4; */  /* Test: Green tint */
/* --color-page-background: #faf5f0; */  /* Test: Warm cream */
```

### 4. **Match Your Brand**
If you have brand colors, convert them to hex and use them:
```css
--color-page-background: #YOUR_BRAND_COLOR;
```

---

## 🔄 Reverting to Original

If you want to go back to the original colors:

```css
--color-page-background: #f9fafb;        /* gray-50 */
--color-card-background: #ffffff;         /* white */
--color-sidebar-background: #ffffff;      /* white */
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `frontend/src/styles/globals.css` | **Change colors here** (lines 82-85) |
| `frontend/src/app/app/**/page.tsx` | All pages use `bg-page` |
| `frontend/src/app/app/layout.tsx` | Sidebar uses `bg-sidebar` |

---

## 🎉 Summary

**To change all page backgrounds:**
1. Open `frontend/src/styles/globals.css`
2. Edit lines 82-85 (the background color variables)
3. Save and refresh browser
4. That's it!

**One file, three lines, entire app updated!** ✨

---

**Last Updated:** 2025-11-28
