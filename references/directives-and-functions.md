# Directives and Functions

Knowledge extracted from Tailwind's "Adding custom styles" documentation and other explicitly indexed canonical Tailwind pages.

This file is progressively maintained. Do not assume a directive or function is exhaustively documented here unless its canonical source page has been ingested.

---

## `@import "tailwindcss"`

**Entry point.** Single import pulls in Preflight, theme, and utilities.

```css
@import "tailwindcss";
```

### Options

| Option | Syntax | Effect |
|--------|--------|--------|
| `source()` | `@import "tailwindcss" source("../src");` | Set base scan path |
| `source(none)` | `@import "tailwindcss" source(none);` | Disable auto-detection; register all explicitly with `@source` |
| `prefix()` | `@import "tailwindcss" prefix(tw);` | Prefix all utilities (e.g., `tw:flex`) |
| `important` | `@import "tailwindcss" important;` | Add `!important` to all utilities |

---

## `@theme`

Define design tokens as CSS custom properties that generate utilities.

```css
@theme {
  --color-brand: oklch(0.7 0.15 200);
  --font-display: "Inter", sans-serif;
  --spacing-section: 6rem;
  --breakpoint-3xl: 120rem;
}
```

### Options

| Option | Syntax | Effect |
|--------|--------|--------|
| `inline` | `@theme inline { --font-sans: var(--font-inter); }` | Resolve variable references at generation time |
| `static` | `@theme static { --color-primary: var(--color-red-500); }` | Force all variables into output CSS |

See `references/theme-and-configuration.md` for full namespace table and customization patterns.

---

## `@layer`

Add custom CSS to Tailwind's cascade layers. Layers control specificity/ordering.

### `@layer base`

For element-level defaults (reset additions, typography baselines):

```css
@layer base {
  h1 {
    font-size: var(--text-2xl);
  }
  h2 {
    font-size: var(--text-xl);
  }
}
```

### `@layer components`

For reusable component classes that utilities can override:

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }

  .select2-dropdown {
    /* third-party component styles */
  }
}
```

Usage in HTML — utilities override component layer:

```html
<div class="card rounded-none">...</div>
```

### `@layer utilities`

For low-level utility additions (rare — prefer `@utility`):

```css
@layer utilities {
  .custom-utility { ... }
}
```

**Layer order (low → high specificity):** `base` → `components` → `utilities` → `@layer` additions.

---

## `@utility`

Register a custom utility class. Automatically inserted into the `utilities` layer with variant support.

### Simple utility

```css
@utility content-auto {
  content-visibility: auto;
}
```

Usage: `<div class="content-auto hover:content-auto">`

### Complex utility (nesting)

```css
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### Functional utilities (accept arguments)

```css
@utility tab-* {
  tab-size: --value(--tab-size-*);
}
```

**`--value()` function** resolves the utility argument. Supports multiple forms:

| Form | Syntax | Matches |
|------|--------|---------|
| Theme value | `--value(--tab-size-*)` | `tab-2`, `tab-github` |
| Bare value (type) | `--value(integer)` | `tab-1`, `tab-76` |
| Literal value | `--value("inherit", "initial")` | `tab-inherit`, `tab-initial` |
| Arbitrary value | `--value([integer])` | `tab-[1]`, `tab-[76]` |

**Multiple `--value()` declarations** — tried left-to-right; failed resolutions omitted:

```css
@utility opacity-* {
  opacity: --value([percentage]);
  opacity: calc(--value(integer) * 1%);
  opacity: --value(--opacity-*);
}
```

**Single `--value()` with multiple args** — resolves left-to-right:

```css
@utility tab-* {
  tab-size: --value(--tab-size-*, integer, [integer]);
}
@utility opacity-* {
  opacity: calc(--value(integer) * 1%);
  opacity: --value(--opacity-*, [percentage]);
}
```

### `--modifier()`

Handles the `/value` modifier (e.g., `tab-2/3`):

```css
@utility tab-* {
  tab-size: --value(integer);
  line-height: --modifier(integer, --default(1));
}
```

### `--default()`

Provides a default when no argument is given:

```css
@utility tab-* {
  tab-size: --value(integer, --default(4));
}
```

Matches both `tab-2` and `tab` (defaults to 4).

### Negative values

Register separate positive/negative utilities:

```css
@utility inset-* {
  inset: --spacing(--value(integer));
  inset: --value([percentage], [length]);
}

@utility -inset-* {
  inset: --spacing(--value(integer) * -1);
  inset: calc(--value([percentage], [length]) * -1);
}
```

### Fractions (ratio)

Use `ratio` data type for fraction utilities:

```css
@utility aspect-* {
  aspect-ratio: --value(--aspect-ratio-*, ratio, [ratio]);
}
```

Matches `aspect-square`, `aspect-3/4`, `aspect-[7/9]`.

### Available bare/arbitrary value types

For `--value(integer)`, `--value([length])`, etc.:

**Bare value types:** `number`, `integer`, `ratio`, `percentage`

**Arbitrary value types:** `absolute-size`, `angle`, `bg-size`, `color`, `family-name`, `generic-name`, `image`, `integer`, `length`, `line-width`, `number`, `percentage`, `position`, `ratio`, `relative-size`, `url`, `vector`, `*`

---

## `@custom-variant`

Define a named variant for reuse in HTML.

### Full syntax (nested)

```css
@custom-variant theme-midnight {
  &:where([data-theme="midnight"] *) {
    @slot;
  }
}
```

### Shorthand syntax (no nesting needed)

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Usage: `<button class="theme-midnight:bg-black">`

### Multiple rules (nested)

```css
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

---

## `@variant` (one-off)

Apply variant logic inside custom CSS without defining a reusable variant.

```css
.my-element {
  background: white;

  @variant dark {
    background: black;
  }

  @variant hover, focus {
    background: gray;
  }

  @variant hover:focus {
    background: black;
  }
}
```

Compiles to equivalent media queries and pseudo-classes.

---

## `@source` (summary)

**Canonical owner:** `references/source-detection.md` (owns `@source` semantics, class discovery, safelisting).

This page mentions `@source` only as part of custom-style workflows. For the authoritative explanation — default scan behavior, `.gitignore`/`node_modules` exclusion, `source()` base path, `@source not`, safelisting with `@source inline()` and brace expansion, and the dynamic-class failure mode — see `source-detection.md`.

Quick syntax for reference:

```css
@source "../node_modules/@acmecorp/ui-lib";   /* scan a vendored lib */
@source not "../src/components/legacy";        /* ignore a path */
@source inline("underline");                   /* safelist a dynamic class */
```

---

## `@apply`

Apply utility classes in custom CSS.

```css
.card {
  @apply rounded-lg bg-white p-4 shadow-sm;
}
```

**Constraints:**
- Only accepts utility classes
- Breaks in some Sass/Less pipelines
- Prefer markup utilities; use only when markup is impractical

---

## `@reference`

Import theme variables, custom utilities, and custom variants into a Vue/Svelte `<style>` block or CSS module **without duplicating CSS output**.

### Reference a project stylesheet

```vue
<style>
  @reference "../../app.css";

  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```

### Reference tailwindcss directly (default theme, no customizations)

```vue
<style>
  @reference "tailwindcss";

  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```

**When to use:** You need `@apply` or `@variant` inside a component's `<style>` block or a CSS module. The `@reference` import makes tokens available without emitting duplicate styles.

---

## Subpath Imports

When using CLI, Vite, or PostCSS, the directives `@import`, `@reference`, `@plugin`, and `@config` support Node.js [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) (like bundler/TS path aliases).

### package.json

```json
{
  "imports": {
    "#app.css": "./src/css/app.css"
  }
}
```

### Vue/Svelte component

```vue
<style>
  @reference "#app.css";

  h1 {
    @apply text-2xl font-bold text-red-500;
  }
</style>
```

**Benefit:** Stable short aliases for cross-project references; requires the matching `package.json` `"imports"` mapping — arbitrary aliases do not resolve without it.

---

## Functions

### `--alpha()`

Adjust the opacity of a color using CSS `color-mix` in oklab.

```css
.my-element {
  color: --alpha(var(--color-lime-300) / 50%);
}
```

**Compiles to:**

```css
.my-element {
  color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
}
```

### `--spacing()`

Generate a spacing value based on your theme's spacing scale.

```css
.my-element {
  margin: --spacing(4);
}
```

**Compiles to:**

```css
.my-element {
  margin: calc(var(--spacing) * 4);
}
```

**In arbitrary values (with `calc()`):**

```html
<div class="py-[calc(--spacing(4)-1px)]">...</div>
```

---

## Compatibility (v3 Legacy)

The following directives and functions exist solely for compatibility with Tailwind CSS v3.x. They can be used alongside CSS-driven features (`@theme`, `@utility`, etc.) — CSS definitions take precedence where merged.

### `@config`

Load a legacy JavaScript-based configuration file:

```css
@config "../../tailwind.config.js";
```

**Unsupported v3 options:** `corePlugins`, `safelist`, `separator`. Use `@source inline()` for safelisting in v4.

### `@plugin`

Load a legacy JavaScript-based plugin:

```css
@plugin "@tailwindcss/typography";
```

Accepts a package name or local path.

### `theme()` function (deprecated)

Access theme values using dot notation:

```css
.my-element {
  margin: theme(spacing.12);
}
```

**Recommendation:** Use CSS theme variables (`var(--spacing)`, `var(--color-*)`) instead. The `theme()` function is deprecated.

---

## `@media`, `@supports`, `@starting-style`, `@slot`

Available inside `@custom-variant` and `@variant`:

| Directive | Purpose |
|-----------|---------|
| `@media (prefers-color-scheme: dark)` | Media queries in variant definitions |
| `@supports (display: grid)` | Feature queries in variant definitions |
| `@starting-style` | Entry animations (`starting:` variant) |
| `@slot` | Where the utility's declarations are injected in a variant |

---

## Operational Notes

- **All directives are v4 CSS-first** — v3 used `tailwind.config.js` for config
- **`@theme` must be top-level** — not nested in selectors/media
- **`@utility` auto-generates variant support** — `hover:`, `focus:`, `md:` work automatically
- **`@custom-variant` is the only way** to change dark mode in v4 (no `darkMode` config)
- **`@layer components` is for overrideable classes** — utilities win on conflict
- **`@apply` with non-utilities fails** — only Tailwind utility classes allowed
- **`source(none)` + explicit `@source`** — isolates multiple Tailwind stylesheets in monorepos

---

## Cross-references

- Theme variables → `references/theme-and-configuration.md`
- Source detection → `references/source-detection.md`
- Variants & states → `references/variants-and-states.md`
- Dark mode → `references/dark-mode.md`
- Utilities & values → `references/utilities-and-values.md`
- Responsive design → `references/responsive-design.md`