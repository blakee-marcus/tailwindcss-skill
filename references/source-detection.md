# Detecting Classes in Source Files

Extracted from https://tailwindcss.com/docs/detecting-classes-in-source-files. Supplemental sources marked inline.

## Overview

Tailwind scans source files as **plain text** (not parsed code) to find utility class tokens, then generates CSS only for matched classes. This enables minimal output and arbitrary values.

## How Classes Are Detected

- Treats all source files as plain text
- Looks for tokens matching expected class-name character patterns
- Generates CSS for matched tokens; discards unmatched tokens
- **Does not understand** string concatenation, interpolation, or runtime logic

## Dynamic Class Names — Hard Failure Mode

**This is the #1 agent-generated Tailwind failure.**

```html
<!-- FAILS: strings don't exist in source -->
<div class="text-{{ error ? 'red' : 'green' }}-600"></div>

<!-- WORKS: complete class names exist in source -->
<div class="{{ error ? 'text-red-600' : 'text-green-600' }}"></div>
```

```jsx
// FAILS: template literal interpolation
function Button({ color }) {
  return <button className={`bg-${color}-600`}>...</button>;
}

// WORKS: static mapping
function Button({ color }) {
  const colorVariants = {
    blue: "bg-blue-600 hover:bg-blue-500",
    red: "bg-red-600 hover:bg-red-500",
  };
  return <button className={`${colorVariants[color]}`}>...</button>;
}
```

**Rule:** Every utility class must appear **completely and literally** in source text at build time.

## Which Files Are Scanned (Default)

Scans everything **except**:
- Files in `.gitignore`
- `node_modules/`
- Binary files (images, videos, zip)
- CSS files
- Common lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`)

## Explicit Source Registration (`@source`)

### Register additional paths

```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```

Use for external Tailwind-built libraries (gitignored by default).

### Set base path (`source()` function)

```css
@import "tailwindcss" source("../src");
```

Useful in monorepos where build runs from repo root.

### Ignore specific paths (`@source not`)

```css
@import "tailwindcss";
@source not "../src/components/legacy";
```

Use for legacy/third-party dirs without Tailwind classes.

### Disable auto-detection entirely (`source(none)`)

```css
@import "tailwindcss" source(none);
@source "../admin";
@source "../shared";
```

Use when multiple Tailwind stylesheets need isolated class sets.

## Safelisting (`@source inline()`)

Force generation of classes not in source files:

```css
@source inline("underline");                    /* single utility */
@source inline("{hover:,focus:,}underline");    /* with variants */
@source inline("{hover:,}bg-red-{50,{100..900..100},950}"); /* brace expansion ranges */
```

Brace expansion syntax (GNU bash-compatible): `{a,b,c}`, `{100..900..100}`.

## Excluding Classes (`@source not inline()`)

```css
@source not inline("{hover:,focus:,}bg-red-{50,{100..900..100},950}");
```

Prevents generation even if detected in source.

## Operational Notes

- **v4 only** — `@source` and `source()` are v4 CSS-first directives; v3 used `content: []` in `tailwind.config.js`
- **Plain-text scanning is a feature, not a bug** — enables arbitrary values, minimal CSS
- **Agent implication:** Never write code that constructs class names at runtime. Always use static maps/objects.
- **Debugging missing utilities:** Check if class exists literally in source; check `.gitignore`/`node_modules` exclusion; check if `@source` registration needed
- **Brace expansion in `@source inline()`** — powerful for safelisting ranges; test generated output

## Cross-references

- Dynamic class rule in SKILL.md (Phase 3: "Dynamic class names fail" — hard rule)
- Utilities & values philosophy → `references/utilities-and-values.md`
- Functions & directives (`@source`, `@source inline`, `source()`) → `references/directives-and-functions.md`
- Theme variables (custom colors must be in theme to generate) → `references/theme-and-configuration.md`