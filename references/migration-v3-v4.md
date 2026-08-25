# Migration v3 to v4

Extracted from https://tailwindcss.com/docs/upgrade-guide. Supplemental sources marked inline.

## Upgrade Tool

- Run `npx @tailwindcss/upgrade` to automate most of the migration (dependencies, config → CSS, template files).
- Requires Node.js 20+.
- Run on a fresh branch; review the diff; test in browser. Tool won't catch everything in complex projects.
- Still read all breaking changes below to catch what the tool misses.

## Pipeline Package Changes

| Concern | v3 | v4 |
|---------|----|----|
| PostCSS plugin | `tailwindcss` (in `postcss.config`) | `@tailwindcss/postcss` |
| Vite plugin | `tailwindcss` PostCSS | `@tailwindcss/vite` (recommended) |
| CLI | `tailwindcss` binary | `@tailwindcss/cli` |
| Imports / vendor prefixes | `postcss-import`, `autoprefixer` | handled internally — remove them |
| JS config | auto-detected `tailwind.config.js` | not auto-detected; load with `@config` directive |

## Breaking Changes (v4)

**Browser floor:** Safari 16.4+, Chrome 111+, Firefox 128+. Needs `@property`, `color-mix()`. Older → stay on v3.4.

### Removed `@tailwind` directives
- v3: `@tailwind base; @tailwind components; @tailwind utilities;`
- v4: `@import "tailwindcss";`

### Removed deprecated utilities
- `bg-opacity-*` / `text-opacity-*` / `border-opacity-*` / `divide-opacity-*` / `ring-opacity-*` / `placeholder-opacity-*` → opacity modifiers (`bg-black/50`)
- `flex-shrink-*` → `shrink-*`
- `flex-grow-*` → `grow-*`
- `overflow-ellipsis` → `text-ellipsis`
- `decoration-slice` → `box-decoration-slice`
- `decoration-clone` → `box-decoration-clone`

### Renamed utilities
- `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
- `drop-shadow-sm` → `drop-shadow-xs`, `drop-shadow` → `drop-shadow-sm`
- `blur-sm` → `blur-xs`, `blur` → `blur-sm`
- `backdrop-blur-sm` → `backdrop-blur-xs`, `backdrop-blur` → `backdrop-blur-sm`
- `rounded-sm` → `rounded-xs`, `rounded` → `rounded-sm`
- `outline-none` → `outline-hidden` (new `outline-none` = truly `outline-style: none`)
- `ring` → `ring-3`

### Outline utility
- `outline` now sets `outline-width: 1px` by default; `outline-<number>` defaults `outline-style: solid`.
- Replace `outline outline-2` → `outline-2`; `focus:outline-none` → `focus:outline-hidden`.

### Ring width + color
- `ring` width: 3px → 1px; default color: `blue-500` → `currentColor`.
- Replace `ring` → `ring-3`; add explicit `ring-blue-500` where you depended on default blue.
- Preserve v3 with (compatibility-only, not idiomatic): `--default-ring-width: 3px; --default-ring-color: var(--color-blue-500);` in `@theme`.

### Space-between / divide selectors
- `.space-y-4 > :not([hidden]) ~ :not([hidden])` → `.space-y-4 > :not(:last-child) { margin-bottom }`.
- `.divide-y-4` similar swap to `:not(:last-child) { border-bottom }`.
- If issues: migrate to flex/grid + `gap`.

### Gradient variants
- v3 variant would reset whole gradient; v4 preserves values.
- To unset a three-stop in a state: `dark:via-none`.

### Container
- v3 `container` options (`center`, `padding`) removed.
- v4: redefine via `@utility container { margin-inline: auto; padding-inline: 2rem; }`.

### Default border color
- v3 `border-*`/`divide-*` defaulted to `gray-200`; v4 defaults to `currentColor`.
- Fix: add explicit color (`border-gray-200`) or add base style preserving v3.

### Preflight changes
- Placeholder color: v3 `gray-400` → v4 `currentColor` at 50% opacity.
- Buttons: `cursor: default` (was `pointer`). Restore with base style if wanted.
- `<dialog>`: margins reset (was centered). Restore `margin: auto` in base if wanted.
- `hidden` attribute now beats `block`/`flex`: remove `hidden` to show. (`hidden="until-found"` exempt.)

### Prefix
- Prefixes look like variants, always at start: `tw:flex`, `tw:bg-red-500`, `tw:hover:bg-red-600`.
- Theme variables still declared without prefix; generated CSS vars get `--tw-` prefix.

### Important modifier
- v3: `!flex` (before variants). v4: `flex!` (at end, after variants): `flex!`, `bg-red-500!`, `hover:bg-red-600/50!`. Old form deprecated but still works.

### Custom utilities
- v3: `@layer utilities { .tab-4 { ... } }` / `@layer components`.
- v4: `@utility tab-4 { ... }` (native cascade layers; `@layer` no longer hijacked).
- Custom utilities sorted by property count; component utilities overridable by Tailwind utilities without config.

### Variant stacking order
- v3: right-to-left. v4: left-to-right (like CSS).
- Reverse order of order-sensitive stacks: `first:*:pt-0 last:*:pb-0` (was `first:*:pt-0` style).

### Variables in arbitrary values
- v3: `bg-[--brand-color]`. v4: `bg-(--brand-color)` (parens, not brackets).

### Grid / object-position arbitrary values
- Commas no longer become spaces; use underscores: `grid-cols-[max-content_auto]` (was `grid-cols-[max-content,auto]`).

### Hover on mobile
- `hover` variant only applies when primary input supports hover (media `(hover: hover)`).
- Override if tap-hover dependency: `@custom-variant hover (&:hover);`.
- Treat hover as enhancement, not required.

### Transitioning outline-color
- `transition`/`transition-colors` now include `outline-color`.
- Fix: set outline color unconditionally or for both states.

### Individual transform properties
- `rotate-*`, `scale-*`, `translate-*` use individual CSS properties.
- `transform-none` no longer resets them: use `scale-none` etc.
- Custom transition lists: use `transition-[opacity,scale]` not `transition-[opacity,transform]`.

### Disabling core plugins
- v3 `corePlugins` option removed (not supported in v4).

### `theme()` function
- Prefer CSS vars: `var(--color-red-500)` over `theme(colors.red.500)`.
- In media queries (no CSS vars): `theme(--breakpoint-xl)` (CSS var name), not `theme(screens.xl)`.

### JS config file
- Still supported for backward compat but NOT auto-detected.
- Load explicitly: `@config "../../tailwind.config.js";`.
- `corePlugins`, `safelist`, `separator` options NOT supported in v4.
- Safelist → `@source inline()`.

### Theme values in JS
- `resolveConfig` removed. Use generated CSS vars directly (e.g. `var(--color-blue-500)`).
- Get a value in JS: `getComputedStyle(document.documentElement).getPropertyValue("--shadow-xl")`.

### `@apply` with Vue/Svelte/CSS modules
- Separately-bundled modules don't see theme vars / custom utilities / variants from other files.
- Fix: `@reference "../../app.css";` before `@apply`, OR use CSS vars directly (`color: var(--text-red-500)`).
- Second option is faster (Tailwind skips processing).

### Sass/Less/Stylus
- v4 not designed for preprocessors; cannot use them in stylesheets or `<style>` blocks.
- See compatibility reference for detail.

**Source:** https://tailwindcss.com/docs/upgrade-guide