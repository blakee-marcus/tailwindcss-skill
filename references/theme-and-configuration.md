# Theme Variables

Extracted from https://tailwindcss.com/docs/theme. Supplemental sources marked inline.

## What Are Theme Variables

Theme variables are CSS variables defined using the `@theme` directive that instruct Tailwind to generate corresponding utility classes.

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

Now `bg-mint-500`, `text-mint-500`, `fill-mint-500` exist as utilities.

Tailwind also generates regular CSS variables so you can reference tokens anywhere:

```html
<div style="background-color: var(--color-mint-500)">...</div>
```

## @theme vs :root

- `@theme` — defines design tokens that **map to utility classes**. Must be top-level, not nested.
- `:root` — regular CSS variables that **don't generate utilities**. Use for non-utility values.

## Theme Variable Namespaces

Each namespace drives specific utilities/variants:

| Namespace | Generates |
|-----------|-----------|
| `--color-*` | Color utilities (`bg-red-500`, `text-sky-300`, etc.) |
| `--font-*` | Font family (`font-sans`, `font-mono`, etc.) |
| `--text-*` | Font size (`text-xl`, `text-2xl`, etc.) |
| `--font-weight-*` | Font weight (`font-bold`, `font-medium`, etc.) |
| `--tracking-*` | Letter spacing (`tracking-wide`, etc.) |
| `--leading-*` | Line height (`leading-tight`, etc.) |
| `--tab-size-*` | Tab size (`tab-github`, etc.) |
| `--breakpoint-*` | Responsive variants (`sm:`, `md:`, `lg:`, etc.) |
| `--container-*` | Container query variants (`@sm:`, `@md:`) + size utilities (`max-w-md`) |
| `--spacing-*` | Spacing/sizing (`px-4`, `max-h-16`, `gap-4`, etc.) |
| `--radius-*` | Border radius (`rounded-sm`, `rounded-xl`, etc.) |
| `--shadow-*` | Box shadow (`shadow-md`, `shadow-xl`, etc.) |
| `--inset-shadow-*` | Inset box shadow (`inset-shadow-xs`, etc.) |
| `--drop-shadow-*` | Drop shadow filter (`drop-shadow-md`, etc.) |
| `--blur-*` | Blur filter (`blur-md`, `blur-xl`, etc.) |
| `--perspective-*` | Perspective (`perspective-near`, etc.) |
| `--zoom-*` | Zoom (`zoom-compact`, etc.) |
| `--aspect-*` | Aspect ratio (`aspect-video`, etc.) |
| `--ease-*` | Transition timing (`ease-out`, `ease-in-out`, etc.) |
| `--animate-*` | Animations (`animate-spin`, `animate-pulse`, etc.) |

## Default Theme

Importing `tailwindcss` includes `theme.css` with defaults for all namespaces (colors, fonts, shadows, spacing, breakpoints, containers, animations, etc.). This is why `bg-red-500`, `font-sans`, `shadow-sm` work out of the box.

**Full default reference** — see the page's "Default theme variable reference" section for the complete `theme.css` (colors in oklch, spacing scale, breakpoint values, container sizes, type scale with line heights, font weights, tracking, leading, radius, shadows, blurs, perspectives, aspects, eases, animations + keyframes).

## Customizing Your Theme

### Extend (add to defaults)

```css
@import "tailwindcss";

@theme {
  --font-script: "Great Vibes", cursive;
}
```

Adds `font-script` alongside defaults.

### Override (replace specific defaults)

```css
@theme {
  --breakpoint-sm: 30rem;  /* was 40rem */
}
```

### Override entire namespace

```css
@theme {
  --color-*: initial;      /* wipe all default colors */
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
}
```

Only your custom colors remain.

### Disable all defaults (custom theme only)

```css
@theme {
  --*: initial;            /* wipe everything */
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --color-coral: oklch(0.74 0.17 40.24);
  /* ...only your tokens... */
}
```

No default utilities from theme variables will exist.

### Animation keyframes

Define `@keyframes` inside `@theme` for `--animate-*`:

```css
@theme {
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;

  @keyframes fade-in-scale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
}
```

### Referencing other variables (inline option)

When a theme variable references another variable, use `inline` so the utility gets the resolved value:

```css
@theme inline {
  --font-sans: var(--font-inter);
}
```

Without `inline`, CSS variable resolution can fail when the referenced variable is defined deeper in the tree.

### Generate all CSS variables (static option)

By default only used variables emit. Use `static` to force all:

```css
@theme static {
  --color-primary: var(--color-red-500);
  --color-secondary: var(--color-blue-500);
}
```

### Sharing across projects

Theme variables are CSS — share via `@import`:

```css
/* packages/brand/theme.css */
@theme {
  --color-lagoon: oklch(0.72 0.11 221.19);
  /* ... */
}

/* packages/admin/app.css */
@import "tailwindcss";
@import "../brand/theme.css";
```

## Using Theme Variables

### In custom CSS (`@layer components`)

```css
@layer components {
  .typography p {
    font-size: var(--text-base);
    color: var(--color-gray-700);
  }
}
```

Useful for styling uncontrolled HTML (Markdown, CMS content).

### In arbitrary values

```html
<div class="rounded-[calc(var(--radius-xl)-1px)]">...</div>
```

### In JavaScript

```js
// Direct CSS variable (e.g., Motion library)
animate={{ backgroundColor: "var(--color-blue-500)" }}

// Resolved value via getComputedStyle
const styles = getComputedStyle(document.documentElement);
const shadow = styles.getPropertyValue("--shadow-xl");
```

**Supplemental:** Motion library example from https://motion.dev/docs/react-quick-start (linked in page, not fetched as authority).

## Operational Notes

- Theme variables **must be top-level** in `@theme` (not nested in selectors/media queries).
- Namespace determines utility mapping — name within namespace freely (`--color-brand-500` → `bg-brand-500`).
- Default theme uses `oklch()` for colors, `rem` for spacing/breakpoints/containers.
- Override with `initial` to remove defaults; `*` syntax wipes entire namespace.
- `inline` option resolves variable references at utility-generation time.
- `static` option forces all variables into output CSS.

## Cross-references

- Responsive design breakpoints → `references/responsive-design.md` (consumes `--breakpoint-*`)
- Container queries → `references/responsive-design.md` (consumes `--container-*`)
- Dark mode colors → `references/dark-mode.md` (consumes `--color-*`)
- Utility philosophy → `references/utilities-and-values.md`
- Functions & directives (`@apply`, `@utility`, `@custom-variant`, `@source`, `@variant`, `@layer`) → `references/directives-and-functions.md`