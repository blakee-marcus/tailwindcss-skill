# Preflight

Knowledge extracted from https://tailwindcss.com/docs/preflight. This file is progressively maintained; it covers what the Preflight docs page documents. For the complete CSS ruleset, see the linked stylesheet in the page.

## What Preflight is

Preflight is an opinionated set of **base styles** built on top of [modern-normalize](https://github.com/sindresorhus/modern-normalize). It smooths over cross-browser inconsistencies and makes it easier to work within a design system.

When you write `@import "tailwindcss";`, Tailwind expands it to three layer imports:

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);
```

`preflight.css` is the reset/normalize portion. It lives in the `base` layer, so utilities in the `utilities` layer can override it.

## Notable reset rules

### Margins and padding are removed

All elements (including pseudo-elements and `::file-selector-button`) get `margin: 0` and `padding: 0`:

```css
*,
::after,
::before,
::backdrop,
::file-selector-button {
  margin: 0;
  padding: 0;
}
```

This prevents accidental reliance on user-agent margins that are not part of your spacing scale.

### Border styles are reset

All elements get `box-sizing: border-box` and `border: 0 solid`:

```css
*,
::after,
::before,
::backdrop,
::file-selector-button {
  box-sizing: border-box;
  border: 0 solid;
}
```

Because of this, adding the single `border` utility always produces a solid `1px` border using `currentColor`. This can conflict with third-party libraries that expect default browser border styles (e.g. Google Maps info windows). In those cases, override Preflight scoped to that component:

```css
@layer base {
  .google-map * {
    border-style: none;
  }
}
```

### Headings are unstyled

Heading elements have the same font size and weight as body text by default:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}
```

Rationale: it prevents accidental deviation from your type scale, and in UI work headings are often visually de-emphasized. Add explicit heading styles in `@layer base` when you want them.

### Lists are unstyled

`ol`, `ul`, and `menu` have `list-style: none` by default. Add list styling consciously with utilities such as `list-inside list-disc`.

#### Accessibility consideration

VoiceOver does not announce unstyled lists as lists. If the content is semantically a list but should remain visually unstyled, add `role="list"`:

```html
<ul role="list">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</ul>
```

### Images and replaced elements are block-level

Images, SVGs, videos, canvases, and similar replaced elements default to `display: block` with `vertical-align: middle`:

```css
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  vertical-align: middle;
}
```

Use the `inline` utility when you need inline replaced elements.

### Images and videos are constrained

```css
img,
video {
  max-width: 100%;
  height: auto;
}
```

This keeps media responsive and prevents overflow. Use `max-w-none` to opt out for a specific element.

### Hidden attribute stays hidden

```css
[hidden]:where(:not([hidden="until-found"])) {
  display: none !important;
}
```

Elements with the `hidden` attribute remain hidden unless they use `hidden="until-found"`. To make an element visible, remove the attribute rather than overriding with `display` utilities.

## Extending Preflight

Add your own base styles in the `base` layer. They will be output after Preflight and before components/utilities:

```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
  }
  h3 {
    font-size: var(--text-lg);
  }
  a {
    color: var(--color-blue-600);
    text-decoration-line: underline;
  }
}
```

Use theme variables so headings stay aligned with your design tokens.

## Disabling Preflight

Import the three Tailwind pieces individually and omit `preflight.css`:

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

This disables Preflight entirely while keeping the theme and utilities.

## Cross-references

- `@layer base` directive syntax and base-layer ordering → `references/directives-and-functions.md`
- `@import "tailwindcss"` options and where to attach them → `references/directives-and-functions.md`
- Theme variables (`var(--text-*)`, `var(--color-*)`) → `references/theme-and-configuration.md`
- Source detection / where to put `source()` → `references/source-detection.md`
