# Responsive Design

Extracted from https://tailwindcss.com/docs/responsive-design. Supplemental sources marked inline.

## Viewport Meta Tag

Required for responsive utilities to work:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Source:** https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag (supplemental, linked by Tailwind page)

## Default Breakpoints

Tailwind uses a mobile-first system with five default breakpoints:

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| `sm`   | 40rem (640px) | `@media (width >= 40rem)` |
| `md`   | 48rem (768px) | `@media (width >= 48rem)` |
| `lg`   | 64rem (1024px) | `@media (width >= 64rem)` |
| `xl`   | 80rem (1280px) | `@media (width >= 80rem)` |
| `2xl`  | 96rem (1536px) | `@media (width >= 96rem)` |

Every utility works with these prefixes: `md:w-32`, `lg:w-48`, `md:flex`, `md:shrink-0`, `md:h-full`, etc.

## Mobile-First Approach

- **Unprefixed utilities** = all screen sizes (mobile base)
- **Prefixed utilities** = at that breakpoint **and above**

### Targeting Mobile

**Wrong:** `sm:text-center` — only centers at 640px+, not on small screens.

**Right:** `text-center sm:text-left` — centers on mobile, left-aligns at sm+.

Implement mobile layout first, then layer `sm`, `md`, `lg`, etc.

## Breakpoint Ranges

Stack a responsive variant with a `max-*` variant to limit to a range:

```html
<div class="md:max-xl:flex">
```

Generates: `@media (width >= 48rem) and (width < 80rem)`.

Available `max-*` variants:

| Variant | Media Query |
|---------|-------------|
| `max-sm` | `@media (width < 40rem)` |
| `max-md` | `@media (width < 48rem)` |
| `max-lg` | `@media (width < 64rem)` |
| `max-xl` | `@media (width < 80rem)` |
| `max-2xl` | `@media (width < 96rem)` |

### Targeting a Single Breakpoint

Stack the breakpoint with the next breakpoint's `max-*`:

```html
<div class="md:max-lg:flex">  <!-- only at md (48rem–64rem) -->
```

## Custom Breakpoints

Define in CSS via `@theme`:

```css
@import "tailwindcss";

@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-2xl: 100rem;
  --breakpoint-3xl: 120rem;
}
```

Creates `xs:`, `3xl:` variants. **Use `rem` for all breakpoints** — mixing units causes unexpected sort order.

### Removing Default Breakpoints

```css
@theme {
  --breakpoint-2xl: initial;  /* removes 2xl */
}
```

Or remove all and define from scratch:

```css
@theme {
  --breakpoint-*: initial;
  --breakpoint-tablet: 40rem;
  --breakpoint-laptop: 64rem;
  --breakpoint-desktop: 80rem;
}
```

## Arbitrary Breakpoint Values

One-off breakpoints without theme changes:

```html
<div class="max-[600px]:bg-sky-300 min-[320px]:text-center">
```

## Container Queries

Style based on **parent element size** instead of viewport. **(supplemental: MDN container queries, linked by Tailwind page)**

### Basic Usage

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">
```

- `@container` marks the containment context (inline-size)
- `@sm`/`@md`/`@lg`/etc. target container width

### Max-Width Container Queries

```html
<div class="@container">
  <div class="flex flex-row @max-md:flex-col">
```

### Container Query Ranges

```html
<div class="@container">
  <div class="flex flex-row @sm:@max-md:flex-col">
```

### Named Containers

For nested containers, name them to target a specific one:

```html
<div class="@container/main">
  <div class="@sm/main:flex-col">
```

### Size Containers

Use `@container-size` for block-size-dependent units (`cqb`, `cqh`):

```html
<div class="@container-size">
  <div class="h-[50cqb]">
```

### Custom Container Sizes

```css
@theme {
  --container-8xl: 96rem;
}
```

```html
<div class="@container">
  <div class="@8xl:flex-row">
```

### Arbitrary Container Query Values

```html
<div class="@container">
  <div class="@min-[475px]:flex-row">
```

### Container Query Length Units

Relative to the query container: **(supplemental: MDN container query units, linked by Tailwind page)**

| Unit | Meaning |
|------|---------|
| `cqw` | 1% of container width |
| `cqh` | 1% of container height |
| `cqi` | 1% of container inline size |
| `cqb` | 1% of container block size |
| `cqmin` | min(cqi, cqb) |
| `cqmax` | max(cqi, cqb) |

```html
<div class="@container">
  <div class="w-[50cqw]">
```

Use `@container-size` for `cqb`/`cqh` (need block size).

### Default Container Sizes

| Variant | Min Width |
|---------|-----------|
| `@3xs` | 16rem (256px) |
| `@2xs` | 18rem (288px) |
| `@xs` | 20rem (320px) |
| `@sm` | 24rem (384px) |
| `@md` | 28rem (448px) |
| `@lg` | 32rem (512px) |
| `@xl` | 36rem (576px) |
| `@2xl` | 42rem (672px) |
| `@3xl` | 48rem (768px) |
| `@4xl` | 56rem (896px) |
| `@5xl` | 64rem (1024px) |
| `@6xl` | 72rem (1152px) |
| `@7xl` | 80rem (1280px) |

## Operational Notes

- **Viewport meta tag is mandatory** — responsive utilities won't work without it.
- **Mobile-first means unprefixed = mobile base** — don't use `sm:` for mobile styles.
- **Container queries need `@container` on parent** — children use `@sm`, `@md`, etc.
- **Mixing breakpoint units breaks sort order** — stick to `rem`.

**Source:** https://tailwindcss.com/docs/responsive-design