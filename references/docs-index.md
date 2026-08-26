# Tailwind Docs Index

Navigation + source inventory. Each entry maps a URL to its topic, relevance to agent tasks, and which local reference file holds the extracted operational knowledge. Fetch the relevant page when a task needs depth beyond this skill. Always confirm the installed version before trusting any doc detail — v3 and v4 differ sharply.

## Installation

- **Tailwind CLI** — https://tailwindcss.com/docs/installation/tailwind-cli — from-scratch / static projects; `npm i tailwindcss @tailwindcss/cli` → `references/installation-and-build.md`
- **Using Vite** — https://tailwindcss.com/docs/installation/using-vite — `@tailwindcss/vite` plugin (preferred for Vite) → `references/installation-and-build.md`
- **Using PostCSS** — https://tailwindcss.com/docs/installation/using-postcss — `@tailwindcss/postcss` plugin (preserve existing PostCSS pipelines) → `references/installation-and-build.md`
- **Play CDN** — https://tailwindcss.com/docs/installation/play-cdn — disposable prototypes only → `references/installation-and-build.md`
- **Framework Guides** — https://tailwindcss.com/docs/installation/framework-guides — Next, Nuxt, SvelteKit, Remix, Astro, etc. → `references/installation-and-build.md`

## Core concepts

- **Detecting classes in source files** — https://tailwindcss.com/docs/detecting-classes-in-source-files — how scanning works, `@source`, `@source inline()`, and the dynamic-class failure mode → `references/source-detection.md`
- **Theme variables** — https://tailwindcss.com/docs/theme — `@theme`, token namespaces, default theme values, extend/override/custom, sharing → `references/theme-and-configuration.md`
- **Functions & directives** — https://tailwindcss.com/docs/functions-and-directives — `@apply`, `@utility`, `@custom-variant`, `@source`, `@variant`, `@reference`, `--alpha()`, `--spacing()` → `references/directives-and-functions.md`
- **Colors** — https://tailwindcss.com/docs/colors — default palette (22 families × 11 shades), all color utilities, opacity, dark mode, CSS variable reference, customization → `references/colors.md`
- **Styling with utility classes** — https://tailwindcss.com/docs/styling-with-utility-classes — utility philosophy, arbitrary values, inline styles guidance, duplication/conflict strategies → `references/utilities-and-values.md`
- **Adding custom styles** — https://tailwindcss.com/docs/adding-custom-styles — `@layer base/components`, `@utility` (simple/complex/functional), `@variant`, `@custom-variant`, arbitrary values deep-dive → `references/directives-and-functions.md`, `references/utilities-and-values.md`, `references/variants-and-states.md`
- **Preflight** — https://tailwindcss.com/docs/preflight — base stylesheet, reset rules, extending/disabling → `references/preflight.md`

## Utilities by area

- **Hover, focus, and other states** — https://tailwindcss.com/docs/hover-focus-and-other-states — all pseudo-classes, pseudo-elements, media/feature queries, attribute selectors, child selectors, parent/sibling variants, negation, arbitrary variants → `references/variants-and-states.md`
- **Dark mode** — https://tailwindcss.com/docs/dark-mode — v4 custom-variant approach (no `darkMode` config key), class/data-attribute selectors, three-way toggle → `references/dark-mode.md`
- **Variants** — https://tailwindcss.com/docs/variants — responsive, state, group, peer, arbitrary → `references/variants-and-states.md`
- **Responsive design** — https://tailwindcss.com/docs/responsive-design — breakpoints, mobile-first → `references/responsive-design.md`

## Upgrade / migration

- **Upgrade guide** — https://tailwindcss.com/docs/upgrade-guide — v3→v4 breaking changes, `@tailwindcss/upgrade` tool, renamed/removed utilities, container config → `references/migration-v3-v4.md`
- **Compatibility** — https://tailwindcss.com/docs/compatibility — browser support matrix (v4 needs Safari 16.4+, Chrome 111+, Firefox 128+) → `references/compatibility-and-browser-support.md`

## Version note

Current major: **v4** (4.3.x as of mid-2026). Verify the installed version with the package manager (`npm ls tailwindcss`) before applying any doc-specific detail.

## Reference ownership model

As reference files grow, each concept has one **canonical local owner**. Other files may summarize or cross-link but should not duplicate the full explanation.

| Concept | Canonical owner |
|---------|-----------------|
| `@source` semantics, class discovery, safelisting | `references/source-detection.md` |
| `@utility`, `@custom-variant`, `@variant`, `@layer`, `@apply`, `@theme` option syntax used for customization, `@reference`, subpath imports, `--alpha()`, `--spacing()`, `@config`, `@plugin`, `theme()` | `references/directives-and-functions.md` |
| Arbitrary values/properties, utility composition, inline styles | `references/utilities-and-values.md` |
| Variant behavior (built-in + custom) | `references/variants-and-states.md` |
| Theme variables, token namespaces, configuration | `references/theme-and-configuration.md` |
| Dark mode | `references/dark-mode.md` |
| Colors | `references/colors.md` |
| Responsive / container queries | `references/responsive-design.md` |
| Installation / build pipelines | `references/installation-and-build.md` |
| v3→v4 migration | `references/migration-v3-v4.md` |
| Browser compatibility | `references/compatibility-and-browser-support.md` |
| Preflight base styles | `references/preflight.md` |

`references/v4-core-reference.md` is a **quick index** — concise syntax snippets that point to the canonical owner for depth. Do not expand it into a duplicate of the detailed references.
