# Variants and States

Extracted from https://tailwindcss.com/docs/hover-focus-and-other-states. Supplemental sources marked inline.

## Core Concept

Every utility class can be applied conditionally by adding a **variant** prefix: `hover:bg-sky-700`, `focus:outline-2`, `dark:md:hover:bg-fuchsia-600`.

Variants stack: `dark:md:hover:bg-fuchsia-600` = dark mode + md breakpoint + hover.

## Variant Categories (built-in)

| Category | Examples |
|----------|----------|
| Pseudo-classes | `hover`, `focus`, `focus-within`, `focus-visible`, `active`, `visited`, `target`, `first`, `last`, `only`, `odd`, `even`, `first-of-type`, `last-of-type`, `only-of-type`, `nth-*`, `nth-last-*`, `nth-of-type-*`, `nth-last-of-type-*`, `empty`, `disabled`, `enabled`, `checked`, `indeterminate`, `default`, `optional`, `required`, `valid`, `invalid`, `user-valid`, `user-invalid`, `in-range`, `out-of-range`, `placeholder-shown`, `details-content`, `autofill`, `read-only` |
| Pseudo-elements | `before`, `after`, `first-line`, `first-letter`, `marker`, `selection`, `file`, `backdrop`, `placeholder` |
| Media/feature queries | `sm`/`md`/`lg`/`xl`/`2xl`, `@sm`/`@md` (container), `dark`, `motion-reduce`/`motion-safe`, `contrast-more`/`contrast-less`, `forced-colors`/`not-forced-colors`, `inverted-colors`, `pointer-fine`/`pointer-coarse`/`pointer-none`, `any-pointer-*`, `portrait`/`landscape`, `noscript`, `print`, `supports-[...]`, `starting` |
| Attribute selectors | `aria-*` (busy, checked, disabled, expanded, hidden, pressed, readonly, required, selected, `[...]`), `data-*` (existence or value), `rtl`/`ltr`, `open` (`<details>`/`<dialog>`/`popover`), `inert` |
| Child selectors | `*` (direct children), `**` (all descendants) |
| Parent/sibling | `group-*` (parent state), `group-has-*`, `group-{name}-*`, `peer-*` (prev sibling), `peer-{name}-*`, `in-*` (any ancestor) |
| Negation | `not-*` (e.g., `hover:not-focus:`) |

## Key Patterns

### Pseudo-class variants
```html
<button class="bg-violet-500 hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700">
```

### Structural pseudo-classes
```html
<!-- first/last remove padding on list items -->
<li class="flex py-4 first:pt-0 last:pb-0">

<!-- zebra stripes -->
<tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900/50 dark:even:bg-gray-950">

<!-- nth-child / nth-of-type with arbitrary values -->
<div class="nth-[2n+1_of_li]:underline">
```

### Form state variants
```html
<input class="invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500">
```

### :has() — style based on descendants
```html
<label class="has-checked:bg-indigo-50 has-checked:text-indigo-800 has-checked:ring-indigo-200">
  <input type="radio" checked>
</label>

<!-- with pseudo-class on descendant -->
<div class="has-[:focus]:ring-2 has-[:focus]:ring-blue-500">
```

### group / peer — parent & sibling state
```html
<!-- group: parent hover affects children -->
<a class="group ..."><svg class="group-hover:stroke-white">...</svg></a>

<!-- named groups for nesting -->
<li class="group/item ..."><a class="group/edit invisible group-hover/item:visible ..."></a></li>

<!-- peer: previous sibling state -->
<label class="peer ...">
  <input type="checkbox" class="peer ...">
  <p class="peer-invalid:visible">Error message</p>
</label>

<!-- named peers -->
<input class="peer/draft ...">
<label class="peer-checked/draft:text-sky-500">Draft</label>
```

### not-* — negation
```html
<!-- hover only when NOT focused -->
<button class="bg-indigo-600 hover:not-focus:bg-indigo-700 focus:outline focus:outline-violet-300">
```

### Pseudo-elements
```html
<!-- ::before / ::after (auto adds content: '') -->
<span class="after:ml-0.5 after:text-red-500 after:content-['*']">Email</span>

<!-- ::placeholder -->
<input class="placeholder:text-gray-500 placeholder:italic">

<!-- ::file (file input button) -->
<input type="file" class="file:mr-4 file:rounded-full file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100">

<!-- ::marker (list bullets) -->
<ul class="list-disc marker:text-sky-400">

<!-- ::selection (text highlight) -->
<div class="selection:bg-fuchsia-300 selection:text-fuchsia-900">

<!-- ::backdrop (dialog) -->
<dialog class="backdrop:bg-gray-50">

<!-- ::first-line / ::first-letter -->
<p class="first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-bold first-line:tracking-widest first-line:uppercase">
```

### Media & feature queries
```html
<!-- Responsive -->
<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

<!-- Container queries -->
<div class="@container"><div class="@md:flex-row">

<!-- Dark mode -->
<div class="bg-white dark:bg-gray-900">

<!-- Reduced motion -->
<svg class="animate-spin motion-reduce:hidden">

<!-- Forced colors (high contrast mode) -->
<input class="appearance-none forced-colors:appearance-auto">
<p class="hidden forced-colors:block">Cyan</p>

<!-- Pointer accuracy -->
<div class="pointer-coarse:grid-cols-3 pointer-coarse:gap-4 pointer-coarse:p-4">

<!-- @supports feature queries -->
<div class="supports-[display:grid]:grid flex supports-backdrop-filter:bg-black/25 supports-backdrop-filter:backdrop-blur">

<!-- Custom @supports shortcuts -->
@custom-variant supports-grid (@supports (display: grid)) { @slot; }
<!-- then: supports-grid:grid -->
```

### starting variant
```html
<!-- entry animation for popover/dialog -->
<div popover class="opacity-0 starting:open:opacity-0 transition-opacity">
```

### ARIA attribute variants
```html
<div aria-checked="true" class="bg-gray-600 aria-checked:bg-sky-700">

<!-- Custom ARIA variants -->
@custom-variant aria-asc (&[aria-sort="ascending"]);
@custom-variant aria-desc (&[aria-sort="descending"]);

<!-- Arbitrary ARIA values -->
<th aria-sort="ascending" class="aria-[sort=ascending]:bg-[url('/img/down-arrow.svg')] aria-[sort=descending]:bg-[url('/img/up-arrow.svg')]">
```

### Data attribute variants
```html
<!-- Existence -->
<div data-active class="data-active:border-purple-500">

<!-- Specific value -->
<div data-size="large" class="data-[size=large]:p-8">

<!-- Custom data variants -->
@custom-variant data-checked (&[data-ui~="checked"]);
```

### RTL/LTR
```html
<div class="ltr:ml-3 rtl:mr-3">
```

### Open/closed state
```html
<details class="open:border-black/10 open:bg-gray-100">
<dialog popover class="opacity-0 open:opacity-100">
```

### Inert
```html
<fieldset inert class="inert:opacity-25">
```

### Child selectors
```html
<!-- * = direct children -->
<ul class="*:rounded-full *:border *:border-sky-100 *:bg-sky-50 *:px-2 *:py-0.5">

<!-- ** = all descendants -->
<ul class="**:data-avatar:size-12 **:data-avatar:rounded-full">
<!-- Note: children can't override parent's * styles (same specificity, later in CSS) -->
```

### Arbitrary variants (one-off selectors)
```html
<!-- Custom selector -->
<li class="[&.is-dragging]:cursor-grabbing">

<!-- Stacked -->
<li class="[&.is-dragging]:active:cursor-grabbing">

<!-- Spaces → underscores -->
<div class="[&_p]:mt-4">

<!-- At-rules in arbitrary variants -->
<div class="[@supports(display:grid)]:grid">
```

### Registering custom variants

**Full syntax (nested):**

```css
@custom-variant theme-midnight {
  &:where([data-theme="midnight"] *) {
    @slot;
  }
}
```

**Shorthand syntax (when nesting isn't required):**

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

Usage in HTML:

```html
<html data-theme="midnight">
  <button class="theme-midnight:bg-black ..."></button>
</html>
```

**Multiple rules (nested):**

```css
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}
```

**Multiple variant rules separated by comma (shorthand):**

```css
@custom-variant hover, focus {
  background: black;
}
```

Note: The comma-separated shorthand is shown in the page as an example of applying the same styles for multiple variants within custom CSS using `@variant`, not `@custom-variant` definition. For defining custom variants with multiple selectors, use the nested approach.

## Quick Reference (from page appendix)

The page includes a complete table mapping every variant to its generated CSS. Key mappings:

| Variant | CSS |
|---------|-----|
| `hover` | `@media (hover: hover) { &:hover }` |
| `focus` | `&:focus` |
| `focus-within` | `&:focus-within` |
| `focus-visible` | `&:focus-visible` |
| `active` | `&:active` |
| `dark` | `@media (prefers-color-scheme: dark)` |
| `motion-reduce` | `@media (prefers-reduced-motion: reduce)` |
| `motion-safe` | `@media (prefers-reduced-motion: no-preference)` |
| `contrast-more` | `@media (prefers-contrast: more)` |
| `forced-colors` | `@media (forced-colors: active)` |
| `pointer-fine` | `@media (pointer: fine)` |
| `pointer-coarse` | `@media (pointer: coarse)` |
| `sm` | `@media (width >= 40rem)` |
| `md` | `@media (width >= 48rem)` |
| `lg` | `@media (width >= 64rem)` |
| `xl` | `@media (width >= 80rem)` |
| `2xl` | `@media (width >= 96rem)` |
| `@sm` | `@container (width >= 24rem)` |
| `@md` | `@container (width >= 28rem)` |
| `*` | `:is(& > *)` |
| `**` | `:is(& *)` |
| `group-hover` | `:is(:where(.group) ...) *` |
| `peer-hover` | `:is(:where(.peer) ...) ~ *` |
| `in-focus` | `:where(...) &:focus` |
| `not-hover` | `&:not(:hover)` |
| `before` | `&::before` |
| `after` | `&::after` |
| `first-line` | `&::first-line` |
| `first-letter` | `&::first-letter` |
| `marker` | `&::marker, & *::marker` |
| `selection` | `&::selection` |
| `file` | `&::file-selector-button` |
| `placeholder` | `&::placeholder` |
| `backdrop` | `&::backdrop` |
| `open` | `&:is([open], :popover-open, :open)` |
| `starting` | `@starting-style` |
| `rtl` | `&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)` |
| `ltr` | `&:where(:dir(ltr), [dir="ltr"], [dir="ltr"] *)` |
| `supports-[...]` | `@supports (...)` |
| `aria-checked` | `&[aria-checked="true"]` |
| `data-[...]` | `&[data-...]` |

## Operational Notes

- **hover on mobile**: `hover` only applies when primary input supports hover (`@media (hover: hover)`). Override with `@custom-variant hover (&:hover);` if tap-hover dependency exists.
- **peer only works on previous siblings** (CSS subsequent-sibling combinator `~`).
- **Children can't override `*` styles** — same specificity, parent's `*` rules come later in CSS.
- **`selection` and `marker` are inheritable** — set on parent to cascade.
- **Arbitrary variants** use `&` for the current selector position; `_` for spaces.

**Source:** https://tailwindcss.com/docs/hover-focus-and-other-states