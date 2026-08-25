# Installation & Build Pipelines

Extracted from:
- https://tailwindcss.com/docs/installation/tailwind-cli
- https://tailwindcss.com/docs/installation/using-vite
- https://tailwindcss.com/docs/installation/using-postcss
- https://tailwindcss.com/docs/installation/play-cdn
- https://tailwindcss.com/docs/installation/framework-guides

Single-page boundary note: These are separate pages but share the same installation root. Combined here as one reference since they form the complete "how to add Tailwind to a project" picture. Each subsection preserves its source URL.

## Overview

Tailwind v4 installs as a **CSS-first** tool. The entrypoint is always `@import "tailwindcss";` in your CSS. The difference is **how the build runs**.

---

## 1. Tailwind CLI — Default for New / Static Projects

**Source:** https://tailwindcss.com/docs/installation/tailwind-cli

### When to use
- No existing build pipeline (static sites, simple HTML, custom setups)
- Want zero-config, zero-dependency (standalone executable available)
- Fastest path from zero to working

### Install
```bash
npm install tailwindcss @tailwindcss/cli
```

### CSS entrypoint (src/input.css)
```css
@import "tailwindcss";
```

### Build command
```bash
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

### HTML
```html
<link href="./output.css" rel="stylesheet">
```

### Standalone executable
Available at https://github.com/tailwindlabs/tailwindcss/releases/latest — runs without Node.js.

---

## 2. Vite Plugin (`@tailwindcss/vite`) — Default for Vite Projects

**Source:** https://tailwindcss.com/docs/installation/using-vite

### When to use
- Project already uses Vite (React, Vue, Svelte, Solid, Laravel, Nuxt, SvelteKit, etc.)
- **Preferred by Tailwind for Vite** — better performance and DX than PostCSS

### Install
```bash
npm install tailwindcss @tailwindcss/vite
```

### vite.config.ts
```ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [ tailwindcss() ],
})
```

### CSS entrypoint
```css
@import "tailwindcss";
```

### Build
```bash
npm run dev
```

---

## 3. PostCSS Plugin (`@tailwindcss/postcss`) — Preserve Existing PostCSS

**Source:** https://tailwindcss.com/docs/installation/using-postcss

### When to use
- Project already has a PostCSS pipeline (Next.js, Angular, custom PostCSS)
- **Preserve existing build architecture** — don't rewrite working PostCSS setup

### Install
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### postcss.config.mjs
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
```

### CSS entrypoint
```css
@import "tailwindcss";
```

### Build
```bash
npm run dev
```

### v4 migration notes (from compatibility page)
- Remove `postcss-import` (handled by Tailwind)
- Remove `autoprefixer` (Lightning CSS handles it)
- Legacy v3 plugin was `tailwindcss` — v4 is `@tailwindcss/postcss`

---

## 4. Play CDN — Disposable Prototypes Only

**Source:** https://tailwindcss.com/docs/installation/play-cdn

### When to use
- **Explicitly disposable prototypes** — learning, quick demos, throwaway experiments
- **Never for production** — no tree-shaking, larger runtime, no customization persistence

### HTML
```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

### Custom CSS (in HTML)
```html
<style type="text/tailwindcss">
  @theme {
    --color-clifford: #da373d;
  }
</style>
```

---

## 5. Framework Guides — Framework-Specific Integrations

**Source:** https://tailwindcss.com/docs/installation/framework-guides

### Listed frameworks (v4)
Next.js, Laravel (Vite), Nuxt, SolidJS, SvelteKit, Gatsby, Angular, Ruby on Rails, React Router, TanStack Start, Phoenix, Parcel, Symfony, Meteor, AdonisJS, Ember.js, Astro, Qwik, Rspack, and more.

### Agent rule
**When a framework guide exists, use it.** The framework guide handles framework-specific wiring (CSS entrypoint location, dev server integration, etc.) that generic Vite/PostCSS/CLI instructions don't cover.

---

## Build Pipeline Selection Rule (Agent Operational Rule)

**CLI as the agent's control surface; preserve framework-native build architecture.**

| Project State | Use |
|---------------|-----|
| Existing Vite project | `@tailwindcss/vite` (preferred by Tailwind) |
| Existing PostCSS project | `@tailwindcss/postcss` |
| No established pipeline / static project | `@tailwindcss/cli` |
| Explicitly disposable prototype | Play CDN |

**Rationale:** The CLI gives Hermes deterministic commands, observable exit codes, generated artifacts, and an easy verification loop. Framework plugins give better performance/DX when the pipeline already exists.

---

## CSS Entrypoint (Universal)

All v4 pipelines use the same CSS entrypoint:

```css
@import "tailwindcss";
```

This imports the default theme, Preflight (reset), and utilities. Add `@theme`, `@custom-variant`, `@source`, etc. after this line.

---

## Common Verification Steps (All Pipelines)

1. **Build runs without errors** — `npm run dev` or CLI command exits 0
2. **Output CSS contains utilities** — check `output.css` or devtools for `.text-3xl`, `.font-bold`, etc.
3. **Classes render in browser** — `text-3xl font-bold underline` produces large bold underlined text
4. **Hot reload works** — edit class, see update without full reload

---

## Operational Notes

- **v4 = CSS-first** — no `tailwind.config.js` required, no `content: []` array
- **`@import "tailwindcss"` is mandatory** — this is the entrypoint, not a directive
- **Package names changed in v4:**
  - CLI: `@tailwindcss/cli` (not `tailwindcss` binary)
  - Vite: `@tailwindcss/vite`
  - PostCSS: `@tailwindcss/postcss`
  - Play CDN: `@tailwindcss/browser@4`
- **Standalone CLI** — useful for environments without Node (CI, containers)
- **Framework guides** — may have additional steps (e.g., Next.js uses PostCSS but has specific config location)

## Cross-references

- CLI-first with framework-native preservation → SKILL.md (Phase 2: Classify)
- v4 core reference (CSS-first config) → `references/v4-core-reference.md`
- Source detection (`@source` registration) → `references/source-detection.md`
- Theme variables (`@theme`) → `references/theme-and-configuration.md`
- Compatibility (browser floors, Lightning CSS) → `references/compatibility-and-browser-support.md`