# Tailwind v4 Core Reference

CSS-first configuration. Assumes v4 (`@import "tailwindcss";`). For v3→v4 differences see the upgrade guide link in `docs-index.md`.

## Entry

```css
@import "tailwindcss";
```

A single import pulls in Preflight, theme, and utilities. No `tailwind.config.js` required.

### Import Options

```css
@import "tailwindcss" source("../src");      /* set base scan path */
@import "tailwindcss" source(none);          /* disable auto-detect; use @source explicitly */
@import "tailwindcss" prefix(tw);            /* prefix all utilities (tw:flex, tw:bg-red-500) */
@import "tailwindcss" important;             /* add !important to all utilities */
```

## Theme tokens (`@theme`)

Define design tokens as CSS custom properties under `@theme`. Namespaces map to utility groups:

```css
@theme {
  --color-brand: oklch(0.7 0.15 200);   /* → bg-brand, text-brand, border-brand */
  --font-display: "Inter", sans-serif;   /* → font-display */
  --spacing-section: 6rem;               /* → p-section, m-section, gap-section */
  --breakpoint-3xl: 120rem;              /* → 3xl: variant */
}
```

Tokens are emitted as real CSS variables so JS and inline styles can read them. Prefer the generated utility over `theme()` in CSS.

### `@theme` Options

```css
@theme inline { --font-sans: var(--font-inter); }  /* resolve variable refs at generation */
@theme static { --color-primary: var(--color-red-500); }  /* force all into output CSS */
```

See `references/theme-and-configuration.md` for full namespace table.

## Custom layers (`@layer`)

```css
@layer base {
  h1 { font-size: var(--text-2xl); }
  h2 { font-size: var(--text-xl); }
}

@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }
}
```

Layer order (low → high): `base` → `components` → `utilities` → your additions.
Utilities override component classes: `<div class="card rounded-none">`.

## Custom utilities (`@utility`)

Quick syntax — full reference in `references/directives-and-functions.md` (owns `@utility` syntax):

```css
@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  &::-webkit-scrollbar { display: none; }
}

@utility tab-* {
  tab-size: --value(--tab-size-*, integer, [integer]);
}
```

`@utility` auto-generates variant support (`hover:`, `focus:`, `md:`). Functional utilities use `--value()` with theme/bare/literal/arbitrary forms; `--modifier()` for `/value`; `--default()` for no-arg defaults.

## Custom variants (`@custom-variant`, `@variant`)

Quick syntax — full reference in `references/variants-and-states.md` (owns variant behavior):

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
/* usage: <button class="theme-midnight:bg-black"> */

.my-element {
  @variant dark { background: black; }
  @variant hover, focus { background: gray; }
}
```

`@custom-variant` = reusable named variant. `@variant` = one-off inside custom CSS.

## Source registration (`@source`)

Quick syntax — full reference in `references/source-detection.md` (owns `@source` semantics and class discovery):

```css
@import "tailwindcss" source("../src");        /* set base scan path */
@source "../node_modules/@acmecorp/ui-lib";     /* scan a vendored lib */
@source not "../src/components/legacy";         /* ignore a path */
@import "tailwindcss" source(none);             /* disable auto-detect; register all explicitly */
@source inline("underline");                    /* safelist a dynamic class */
```

Use when classes live in `node_modules` (gitignored), a monorepo subproject, or are genuinely dynamic (fed from CMS). Prefer static maps over safelisting — see SKILL.md Phase 5.

## Dark mode (v4)

No `darkMode` config key in v4. Define the variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Then `dark:bg-slate-900` etc., toggling `.dark` on a parent.

## `@apply`

```css
.card { @apply rounded-lg bg-white p-4 shadow-sm; }
```

Only accepts utility classes. Avoid inside Sass/Less pipelines (ordering/parsing issues). Prefer markup utilities; use `@apply` only for component classes where markup is impractical.

## Key v4 vs v3 differences (quick)

- Import: `@import "tailwindcss";` not `@tailwind base/components/utilities;`
- Config: CSS-first via `@theme`; `tailwind.config.js` optional.
- PostCSS: `@tailwindcss/postcss` package, not `tailwindcss` plugin.
- CLI: `@tailwindcss/cli` package (was `tailwindcss` binary).
- Ring default: `1px` (v3 was `3px`; `ring` → `ring-3`).
- Renamed: `shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden` (new `outline-none` = truly none).
- Browsers: Safari 16.4+, Chrome 111+, Firefox 128+.
