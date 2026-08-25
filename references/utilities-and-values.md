# Utilities and Values

Extracted from https://tailwindcss.com/docs/styling-with-utility-classes. Supplemental sources marked inline.

## Utility Class Philosophy

Utility classes are single-purpose presentational classes applied directly in markup:

```html
<div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg">
```

Benefits (from the docs):
- **Faster** — no class naming, selector decisions, or HTML/CSS switching
- **Safer changes** — utilities affect only the element they're on
- **Easier maintenance** — find element, change classes; no custom CSS to remember
- **More portable** — structure + styling together; copy-paste works across projects
- **CSS stops growing** — utilities are reusable; CSS doesn't grow linearly with features

## Why Not Inline Styles

Utility classes ≠ inline styles. Advantages:
- **Design constraints** — choose from predefined design system (`theme`), not magic numbers
- **State variants** — `hover:`, `focus:` etc. work; inline styles can't target states
- **Media queries** — `sm:`, `md:` etc. work; inline styles can't use media queries

## Class Composition (CSS Variables)

When multiple utilities target the same CSS property (e.g., `filter`), Tailwind uses CSS variables to compose:

```html
<div class="blur-sm grayscale">
```

```css
.blur-sm {
  --tw-blur: blur(var(--blur-sm));
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-grayscale,);
}
.grayscale {
  --tw-grayscale: grayscale(100%);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-grayscale,);
}
```

Each utility sets its own variable; the property falls back to nothing if unset. Same pattern for gradients, shadow colors, transforms.

## Arbitrary Values

Square bracket syntax for one-off values outside theme:

```html
<!-- Color -->
<button class="bg-[#316ff6]">Sign in with Facebook</button>

<!-- Complex grid -->
<div class="grid grid-cols-[24rem_2.5rem_minmax(0,1fr)]">

<!-- calc() with theme values -->
<div class="max-h-[calc(100dvh-(--spacing(6)))]">

<!-- Arbitrary property (CSS variable) -->
<div class="[--gutter-width:1rem] lg:[--gutter-width:2rem]">
```

Tailwind scans for class-like tokens and generates CSS for arbitrary values at compile time.

### Arbitrary Values with Modifiers

Arbitrary values work with interactive and responsive modifiers:

```html
<div class="top-[117px] lg:top-[344px]">
```

### CSS Variable Shorthand

When referencing a CSS custom property as an arbitrary value, use the `-(--name)` shorthand:

```html
<div class="fill-(--my-brand-color) ...">
```

This is shorthand for `fill-[var(--my-brand-color)]` — Tailwind adds the `var()` wrapper automatically.

### Arbitrary Properties

Use square bracket notation with a colon to write completely arbitrary CSS properties:

```html
<div class="[mask-type:luminance]">
```

This works with modifiers:

```html
<div class="[mask-type:luminance] hover:[mask-type:alpha]">
```

Useful for CSS variables that need to change under conditions:

```html
<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
```

### Arbitrary Variants

Arbitrary variants allow on-the-fly selector modification using square bracket notation:

```html
<ul role="list">
  {#each items as item}
  <li class="lg:[&:nth-child(-n+3)]:hover:underline">{item}</li>
  {/each}
</ul>
```

The `&` represents the current selector position.

### Handling Whitespace

When an arbitrary value needs a space, use underscore (`_`):

```html
<div class="grid grid-cols-[1fr_500px_2fr]">
```

Tailwind converts `_` to space at build time.

**URLs preserve underscores** (spaces invalid in URLs):

```html
<div class="bg-[url('/what_a_rush.png')]">
```

**Escape underscore with backslash** when a space is valid but you need a literal underscore:

```html
<div class="before:content-['hello\_world']">
```

In JSX where backslashes are stripped, use `String.raw()`:

```jsx
<div className={String.raw`before:content-['hello\_world']`} />
```

### Resolving Ambiguities

Many utilities share a namespace but map to different CSS properties (e.g., `text-` for both `font-size` and `color`). Tailwind usually infers from the value:

```html
<!-- font-size utility -->
<div class="text-[22px]">...</div>

<!-- color utility -->
<div class="text-[#bada55]">...</div>
```

**Ambiguous with CSS variables** — hint the type with a CSS data type:

```html
<!-- font-size -->
<div class="text-(length:--my-var)">...</div>

<!-- color -->
<div class="text-(color:--my-var)">...</div>
```

Available type hints: `<length>`, `<color>`, `<percentage>`, `<number>`, `<integer>`, `<ratio>`, `<angle>`, `<time>`, `<frequency>`, `<resolution>`, `<url>`, `<image>`, `<position>`, `<bg-size>`, `<vector>`, `<family-name>`, `<generic-name>`, `<absolute-size>`, `<relative-size>`, `<line-width>`, `<text-edge>`, `<transform-function>`, `<custom-ident>`, `<dashed-ident>`, `<string>`, `<system-color>`, `<hue>`, `<alpha-value>`, `<color-stop-list>`, `<linear-color-stop>`, `<linear-color-hint>`, `<ending-shape>`, `<position-area>`, `<self-position>`, `<shape>`, `<timeline-range-name>`.

## When to Use Inline Styles

Still useful for:
- **Dynamic values from DB/API** — `style={{ backgroundColor: buttonColor }}`
- **Very complex arbitrary values** hard to read as class names
- **Setting CSS variables from dynamic sources**, then referencing with utilities:

```jsx
style={{ "--bg-color": buttonColor, "--bg-color-hover": buttonColorHover }}
className="bg-(--bg-color) text-(--text-color) hover:bg-(--bg-color-hover)"
```

## Managing Duplication

| Strategy | When |
|----------|------|
| **Loops** | Rendered elements in a loop (avatar list, card grid) — markup authored once |
| **Multi-cursor editing** | Localized duplication in one file — Alt+Click / Ctrl+D to edit simultaneously |
| **Components** | Reuse across files — React/Vue/Svelte component or template partial (Blade, ERB, etc.) |
| **Custom CSS** | Templating languages where partial feels heavy — use `@utility` or `@layer components` with theme variables |

### Custom CSS Example (v4)

```css
@import "tailwindcss";

@utility btn-primary {
  border-radius: calc(infinity * 1px);
  background-color: var(--color-violet-500);
  padding-inline: --spacing(5);
  padding-block: --spacing(2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
  box-shadow: var(--shadow-md);
  &:hover {
    @media (hover: hover) {
      background-color: var(--color-violet-700);
    }
  }
}
```

Prefer components/partials for anything beyond a single element. Full `@utility` syntax (functional utilities, `--value()`, `--modifier()`, `--default()`, negative values, fractions) → `references/directives-and-functions.md`.

## Managing Style Conflicts

### Conflicting Utilities

Later in stylesheet wins (not class attribute order):

```html
<div class="grid flex">  /* grid wins if .grid appears after .flex in CSS */</div>
```

**Rule:** Never add two conflicting classes. Use conditional logic in component:

```jsx
<div className={gridLayout ? "grid" : "flex"}>
```

### Important Modifier

Per-utility: `bg-red-500!` → adds `!important` to all declarations.

Global (all utilities): `@import "tailwindcss" important;` — use when integrating with high-specificity existing CSS.

### Prefix Option

```css
@import "tailwindcss" prefix(tw);
```

Generates `tw:flex`, `tw:bg-red-500`, `--tw-color-red-500`. Theme variables declared without prefix; CSS vars get `--tw-` prefix.

**Source:** https://tailwindcss.com/docs/styling-with-utility-classes