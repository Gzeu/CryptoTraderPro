# CryptoTraderPro Design System

## Overview

A comprehensive design system for the CryptoTraderPro trading dashboard, featuring modern crypto aesthetics, glassmorphism effects, and professional data visualization patterns.

---

## Color Palette

### Primary Colors (Crypto Theme)

- **Crypto Purple**: `#7c3aed` (Primary action color)
- **Crypto Dark**: `#3f0f5c` (Dark accents)
- **Crypto Light**: `#f5f3ff` (Light backgrounds)

### Trading Colors

- **Bullish Green**: `#22c55e` (Up trends)
- **Bearish Red**: `#ef4444` (Down trends)

### Neutral Colors

- **Slate 50-950**: Complete grayscale palette for UI elements
- **Dark Background**: `#0f172a` (Primary background)
- **Card Background**: `#1e293b` (Secondary background)

---

## Typography

### Font Family
- **Primary**: Inter (system-ui fallback)
- **Monospace**: SF Mono (for data values)

### Sizing Scale

| Name | Size | Line Height |
|------|------|-------------|
| xs   | 0.75rem | 1rem |
| sm   | 0.875rem | 1.25rem |
| base | 1rem | 1.5rem |
| lg   | 1.125rem | 1.75rem |
| xl   | 1.25rem | 1.75rem |
| 2xl  | 1.5rem | 2rem |
| 3xl  | 1.875rem | 2.25rem |
| 4xl  | 2.25rem | 2.5rem |

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## Spacing System

Based on 4px base unit:

- `2px` (0.5 × base)
- `4px` (1 × base)
- `8px` (2 × base)
- `12px` (3 × base)
- `16px` (4 × base)
- `24px` (6 × base)
- `32px` (8 × base)
- `40px` (10 × base)
- `48px` (12 × base)

---

## Component Classes

### Cards & Containers

```html
<!-- Glassmorphism Card -->
<div class="card-glass">Content</div>

<!-- Crypto Card -->
<div class="card-crypto">Trading Data</div>
```

### Indicators

```html
<!-- Bullish Indicator -->
<span class="indicator-bullish">📈</span>

<!-- Bearish Indicator -->
<span class="indicator-bearish">📉</span>
```

### Badges

```html
<span class="badge-success">Success</span>
<span class="badge-danger">Error</span>
<span class="badge-info">Info</span>
```

### Gradients

```html
<!-- Text Gradient -->
<h1 class="text-gradient">Crypto Pro</h1>

<!-- Bullish Gradient -->
<div class="text-gradient-bullish">+12.5%</div>

<!-- Bearish Gradient -->
<div class="text-gradient-bearish">-5.3%</div>
```

### Flexbox Utilities

```html
<!-- Center Content -->
<div class="flex-center">Centered</div>

<!-- Space Between -->
<div class="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## Animations

### Keyframe Animations

- **pulse-glow**: Pulsing opacity effect for glowing elements
- **shimmer**: Loading placeholder animation
- **slide-in**: Element slides in from left
- **fade-in**: Element fades in from transparent

### Usage

```css
.loading-element {
  @apply animate-shimmer;
}

.glowing-box {
  @apply animate-pulse-glow;
}
```

---

## Shadows & Effects

### Box Shadows

- **glass**: `0 8px 32px 0 rgba(31, 38, 135, 0.37)` (Glassmorphism)
- **neon**: Blue glow effect for crypto elements
- **neon-red**: Red glow for bearish indicators
- **neon-green**: Green glow for bullish indicators

### Backdrop Filters

```css
.glass-effect {
  @apply backdrop-blur-md bg-gradient-glass;
}
```

---

## Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

---

## Dark Mode

Dark mode is enabled by default using Tailwind's class-based strategy.

```html
<!-- Automatically works in dark mode -->
<div class="bg-white dark:bg-slate-900">Content</div>
```

---

## Best Practices

### 1. Consistency
- Always use predefined colors from the palette
- Stick to the spacing scale
- Use consistent typography sizing

### 2. Accessibility
- Maintain sufficient color contrast
- Use semantic HTML
- Provide focus states for interactive elements

### 3. Performance
- Use CSS classes instead of inline styles
- Leverage Tailwind's purge functionality
- Optimize images and assets

### 4. Crypto Trading Specific
- Green for bullish/positive trends
- Red for bearish/negative trends
- Use monospace fonts for numbers
- Provide clear visual hierarchy for prices

---

## Component Examples

### Trading Card

```html
<div class="card-crypto">
  <div class="flex-between">
    <h3 class="text-lg font-semibold">BTC</h3>
    <span class="text-gradient-bullish">+5.2%</span>
  </div>
  <p class="text-4xl font-bold mt-2">$42,500</p>
</div>
```

### Data Table

```html
<table class="table-striped table-hover w-full">
  <thead>
    <tr class="bg-slate-800/30">
      <th class="text-left">Asset</th>
      <th class="text-right">Price</th>
      <th class="text-right">Change</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bitcoin</td>
      <td class="text-right">$42,500</td>
      <td class="text-right indicator-bullish">+2.1%</td>
    </tr>
  </tbody>
</table>
```

---

## Future Enhancements

- [ ] Design tokens export for Figma
- [ ] Component library with Storybook
- [ ] Interactive design system documentation site
- [ ] Accessibility audit and improvements
- [ ] Animation library expansion
- [ ] Theme customization options

---

## Version History

**v1.0** (November 2025)
- Initial design system release
- Tailwind config with crypto colors
- Global styles with 30+ utility classes
- Complete documentation
