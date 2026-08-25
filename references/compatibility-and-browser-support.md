# Compatibility and Browser Support

Extracted from https://tailwindcss.com/docs/compatibility. Supplemental sources marked inline.

## Browser Support (v4)

Tailwind CSS v4.0 is designed for and tested on these minimum versions:

| Browser | Minimum Version | Release Date |
|---------|----------------|--------------|
| Chrome  | 111            | March 2023   |
| Safari  | 16.4           | March 2023   |
| Firefox | 128            | July 2024    |

Core framework functionality specifically depends on these versions. If you need to support older browsers, stay on v3.4.

### Bleeding-edge features with limited support

Some utilities/variants use features not yet widely supported:

- `@starting-style` — Chrome 117+, Safari 17.5+, Firefox 129+ **(supplemental: caniuse.com/mdn-css_at-rules_starting-style, consulted to verify browser versions for this feature mentioned on the Tailwind page)**
- `field-sizing: content`
- `text-wrap: balance`

**Rule:** If your target browsers don't support a feature, simply don't use those utilities. Tailwind does not polyfill.

### Verification

Check the installed Tailwind version and your project's `browserslist` / target config before using modern features.

## Sass, Less, and Stylus

**Tailwind CSS v4 is not designed to be used with CSS preprocessors.**

> Think of Tailwind CSS itself as your preprocessor — you shouldn't use Tailwind with Sass for the same reason you wouldn't use Sass with Stylus.

Since Tailwind targets modern browsers, you don't need a preprocessor for:

- **Nesting** — handled by Lightning CSS (see below)
- **Variables** — native CSS custom properties
- **Build-time imports** — `@import` bundles files
- **Vendor prefixes** — added automatically by Lightning CSS
- **Color/math functions** — `color-mix()`, `min()`, `max()`, `round()` are native

### Build-time imports

```css
@import "tailwindcss";
@import "./typography.css";
```

Tailwind bundles `@import`ed files into compiled CSS without `postcss-import` or Sass.

### Variables

Native CSS custom properties work everywhere Tailwind works:

```css
.typography {
  font-size: var(--text-base);
  color: var(--color-gray-700);
}
```

Tailwind relies on CSS variables internally; if you can use Tailwind, you can use native variables.

### Nesting

Lightning CSS (Rust-based, used by Tailwind) processes nested CSS:

```css
.typography {
  p { font-size: var(--text-base); }
  img { border-radius: var(--radius-lg); }
}
```

→ flattened to `.typography p { ... }` and `.typography img { ... }` for browser compatibility.

Native CSS nesting is also widely supported; you don't need a preprocessor for it.

### Loops

Not needed. Utility classes like `col-span-1`, `col-span-2`, etc. are generated on-demand when used. Most styling happens in HTML, not CSS files, so programmatic rule generation (loops) is unnecessary.

### Color and math functions

- **Color:** Use predefined palette shades (`hover:bg-indigo-600`) or native `color-mix()` for runtime adjustment (works with CSS variables and `currentcolor`, unlike preprocessors). **(supplemental: MDN color-mix() page, consulted to confirm native browser support for this feature mentioned on the Tailwind page)**
- **Math:** `min()`, `max()`, `round()`, `calc()` are native.

**Source:** https://tailwindcss.com/docs/compatibility

## CSS Modules

**Compatible but not recommended.** Co-exists if introducing Tailwind into an existing CSS-modules project, but avoid combining if possible.

### Why not

1. **Scoping** — Utility classes are naturally scoped; CSS modules solve a problem that doesn't exist with Tailwind.
2. **Performance** — Each CSS module runs Tailwind separately. 50 modules = 50 Tailwind runs = slow builds, bad DX.
3. **Context sharing** — CSS modules are processed separately; no `@theme` unless you import it.

### Making `@apply` work in CSS modules

```css
@reference "../app.css";  /* import global styles as reference */

button {
  @apply bg-blue-500;
}
```

### Better: use CSS variables instead of `@apply`

```css
button {
  background: var(--color-blue-500);
}
```

Benefits: Tailwind skips processing the file → faster builds; variables work without `@reference`.

**Source:** https://tailwindcss.com/docs/compatibility

## Vue, Svelte, and Astro

`<style>` blocks in these frameworks behave like CSS modules — same drawbacks.

**Recommendation:** Avoid `<style>` blocks in components. Style with utility classes directly in markup.

If you must use `<style>` blocks:

```vue
<style scoped>
@reference "../app.css";

button {
  @apply bg-blue-500;
}
</style>
```

Or prefer CSS variables:

```vue
<style scoped>
button {
  background-color: var(--color-blue-500);
}
</style>
```

**Source:** https://tailwindcss.com/docs/compatibility

## Lightning CSS

Tailwind uses **Lightning CSS** (Rust, by Parcel team) under the hood for:

- Nesting flattening
- Vendor prefixing
- Minification (combines longhands, merges rules, reduces `calc()`, shortens colors, minifies gradients)
- CSS modules support (local scoping of classes, ids, `@keyframes`, CSS variables)
- Transpilation of modern syntax to compatible output based on browser targets

~100x faster than JS-based tools; ~2.7M lines/sec single-threaded minification.

**(supplemental: https://lightningcss.dev/, consulted to characterize the underlying engine that the Tailwind page references but does not detail)**

## Migration Note

v3 used `postcss-import` and `autoprefixer` explicitly. v4 handles imports and prefixes internally via Lightning CSS — remove those plugins when upgrading.

**Source:** https://tailwindcss.com/docs/upgrade-guide