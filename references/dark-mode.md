# Dark Mode

Extracted from https://tailwindcss.com/docs/dark-mode. Supplemental sources marked inline.

## Overview

Tailwind includes a `dark` variant that applies styles when dark mode is enabled. By default this uses the `prefers-color-scheme` CSS media feature.

```html
<div class="bg-white dark:bg-gray-800 ...">
  <h3 class="text-gray-900 dark:text-white">...</h3>
  <p class="text-gray-500 dark:text-gray-400">...</p>
</div>
```

## Toggling Dark Mode Manually (v4)

v4 has **no `darkMode` config key**. Override the `dark` variant with `@custom-variant` in your CSS entrypoint:

### Class-based (most common)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Now `dark:*` utilities apply when the `.dark` class exists on an ancestor (typically `<html>`):

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">...</div>
  </body>
</html>
```

Add/remove `.dark` via JS (commonly inline in `<head>` to avoid FOUC):

```js
// On load: respect localStorage or system preference
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
);

// Explicit user choices
localStorage.theme = "light";  // force light
localStorage.theme = "dark";   // force dark
localStorage.removeItem("theme");  // respect OS
```

### Data-attribute based

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<html data-theme="dark">...</html>
```

### Three-way toggle (light / dark / system)

Combine custom variant with `window.matchMedia()` (MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia — supplemental, not fetched as authority):

```js
// Inline in <head> to avoid FOUC
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
);
```

User stores explicit preference in `localStorage.theme` ("light" | "dark"); absence means "system".

## Key v4 Differences from v3

| v3 | v4 |
|---|---|
| `darkMode: "media"` / `"class"` in `tailwind.config.js` | `@custom-variant dark (...)` in CSS |
| Config-driven | CSS-first, fully customizable selector |
| Limited to class or media query | Any valid CSS selector (`:where()`, attribute, etc.) |

## Operational Notes

- **No `darkMode` key in v4** — do not look for it in config files; it does not exist.
- **`@custom-variant` is the only way** to change dark mode behavior in v4.
- **FOUC prevention** — toggle script belongs inline in `<head>` before body renders.
- **`window.matchMedia`** — standard API, widely supported (MDN link in page is supplemental reference).
- **SVG namespace** (`http://www.w3.org/2000/svg`) appears in page examples — not fetched.

## Cross-references

- Variant system overview → `references/variants-and-states.md`
- Theme variables (for dark-mode colors) → `references/theme-and-configuration.md`
- Responsive design (media query mental model) → `references/responsive-design.md`