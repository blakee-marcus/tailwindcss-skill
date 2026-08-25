# Colors

Extracted from https://tailwindcss.com/docs/colors. Supplemental sources marked inline.

## Default Color Palette

Tailwind includes **22 color families** × **11 shades (50–950)** = 242 default colors, all in `oklch()` format.

| Family | Example (500) |
|--------|---------------|
| red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone | `--color-sky-500: oklch(68.5% 0.169 237.323)` |

**Full palette reference** — see the source page's "Default color palette reference" section for all 242 values. Do not replicate the table locally; link to source when exact values are needed.

**Additional families (v4 additions):** `mauve`, `mist`, `olive`, `taupe` — also 11 shades each.

**Semantic colors:** `--color-black` (`#000`), `--color-white` (`#fff`).

## Color Utilities

All color utilities draw from the `--color-*` namespace:

| Utility | CSS Property |
|---------|--------------|
| `bg-*` | background-color |
| `text-*` | color |
| `decoration-*` | text-decoration-color |
| `border-*` | border-color |
| `outline-*` | outline-color |
| `shadow-*` | box-shadow color |
| `inset-shadow-*` | inset box-shadow color |
| `ring-*` | ring-shadow color |
| `inset-ring-*` | inset ring color |
| `accent-*` | accent-color |
| `caret-*` | caret-color |
| `scrollbar-thumb-*` | scrollbar thumb color |
| `scrollbar-track-*` | scrollbar track color |
| `fill-*` | SVG fill |
| `stroke-*` | SVG stroke |

## Opacity

### In markup (utility syntax)

```html
<div class="bg-black/75">...</div>           <!-- 75% opacity -->
<div class="bg-pink-500/[71.37%]">...</div>  <!-- arbitrary percentage -->
<div class="bg-cyan-400/(--my-alpha-value)">...</div>  <!-- CSS variable -->
```

### In CSS (`--alpha()` function)

```css
@layer components {
  .DocSearch-Hit--Result {
    background-color: --alpha(var(--color-gray-950) / 10%);
  }
}
```

## Dark Mode

Use the `dark:` variant with any color utility:

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <h3 class="dark:text-white">...</h3>
  <p class="text-gray-500 dark:text-gray-400">...</p>
</div>
```

See `references/dark-mode.md` for `@custom-variant` configuration.

## Referencing in CSS

Colors are exposed as CSS variables in `--color-*` namespace:

```css
@layer components {
  .typography {
    color: var(--color-gray-950);
    a {
      color: var(--color-blue-500);
      &:hover { color: var(--color-blue-800); }
    }
  }
}
```

As arbitrary values with `light-dark()`:

```html
<div class="bg-[light-dark(var(--color-white),var(--color-gray-950))]">...</div>
```

## Customizing Colors

All customization via `@theme` in the `--color-*` namespace.

### Add custom colors (extends defaults)

```css
@theme {
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

Generates `bg-midnight`, `text-tahiti`, `fill-bermuda`, etc.

### Override specific defaults

```css
@theme {
  --color-gray-500: oklch(0.55 0.02 260);
}
```

### Disable specific color families

```css
@theme {
  --color-lime-*: initial;
  --color-fuchsia-*: initial;
}
```

Removes those CSS variables from output.

### Custom palette only (disable all defaults)

```css
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-purple: #3f3cbb;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

Only your colors exist.

### Reference external CSS variables (`@theme inline`)

```css
:root { --acme-canvas-color: oklch(0.967 0.003 264.542); }
[data-theme="dark"] { --acme-canvas-color: oklch(0.21 0.034 264.665); }

@theme inline {
  --color-canvas: var(--acme-canvas-color);
}
```

Resolves the variable at utility-generation time. See `theme-and-configuration.md` → "Referencing other variables".

## Operational Notes

- **All color utilities derive from `--color-*` theme variables** — adding/overriding in `@theme` is the single source of truth.
- **Opacity in markup uses `/` syntax** — works with default shades, arbitrary percentages, and CSS variables.
- **`--alpha()` is a Tailwind-specific CSS function** — only works in compiled CSS, not in arbitrary values.
- **`light-dark()` in arbitrary values** — enables automatic light/dark switching without `dark:` variant.
- **Disabling unused color families** — reduces output CSS size (removes corresponding CSS variables).
- **SVG namespace** (`http://www.w3.org/2000/svg`) appears in examples — supplemental, not fetched.

## Cross-references

- Theme variables system → `references/theme-and-configuration.md` (owns `--color-*` namespace)
- Dark mode variants → `references/dark-mode.md`
- Utility philosophy → `references/utilities-and-values.md`
- Functions & directives → `references/directives-and-functions.md`