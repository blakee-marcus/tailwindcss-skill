---
name: tailwind-css
description: Build, modify, and debug Tailwind CSS projects by version.
version: 0.1.0
author: Blake Marcus, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [tailwind, css, frontend, ui, vite, postcss, cli]
    related_skills: []
---

# Tailwind CSS Skill

Use this skill to implement, modify, review, migrate, and debug Tailwind CSS projects against the installed Tailwind version and current official documentation.

Treat inspection as the first move. Prefer preserving an existing framework-native integration over swapping it for the CLI just because the CLI is available.

## When to Use

- Building Tailwind into a new or existing frontend project
- Adding utilities, responsive states, dark mode, theme variables, or component styles
- Migrating a project from Tailwind v3 to v4
- Debugging missing/incorrect styles, broken builds, or suspect class detection
- Reviewing PRs or generated code that touches Tailwind

**Don't use for:** general CSS architecture unrelated to Tailwind, non-Tailwind styling systems (CSS Modules, styled-components, vanilla-extract), or design-token strategy outside Tailwind's config model.

## Operating Rule: Control Surface vs Architecture

Tailwind CLI is the agent's control surface: deterministic commands, observable exit codes, generated artifacts, and an easy verification loop. But it is not the default for every project.

Preserve the project's build architecture:

- **Existing Vite project** → use/repair `@tailwindcss/vite`
- **Existing PostCSS project** → use/repair `@tailwindcss/postcss`
- **No established build pipeline / static project** → use `@tailwindcss/cli`
- **Play CDN** → only for explicitly disposable prototypes

Do not replace a working framework-native integration merely because the CLI is available.

Authority order (highest first):

1. Installed Tailwind package version
2. Existing project configuration
3. Current official Tailwind documentation
4. Successful project build (exit 0, expected CSS emitted)
5. Remembered Tailwind conventions (lowest — easily stale across v3/v4)

## Phase 1: Detect

Inspect before changing anything. Gather:

- `package.json` — `tailwindcss` dependency + version range, scripts, package-manager lockfile
- Installed version — `npm ls tailwindcss` (or pnpm/yarn/bun equivalent)
- `vite.config.*` — presence of `@tailwindcss/vite` or `tailwindcss()` plugin
- `postcss.config.*` — presence of `@tailwindcss/postcss` or legacy `tailwindcss` PostCSS plugin
- CSS entrypoints — files with `@import "tailwindcss"` or `@tailwind` directives
- `tailwind.config.*` — exists and whether it is actually loaded
- Package manager — npm / pnpm / yarn / bun (drive it consistently thereafter)
- Framework — Vite, Next, Nuxt, SvelteKit, Remix, static HTML, none

Completion criterion: you can state the project's version (v3 or v4), pipeline (Vite/PostCSS/CLI/none), and package manager without guessing.

## Phase 2: Classify

Two axes:

**Version:** v3 vs v4.

- v4: CSS-first, `@import "tailwindcss";`, no required `tailwind.config.js`, `@theme`/`@utility`/`@source` directives, `@tailwindcss/*` packages for Vite/PostCSS/CLI.
- v3: `tailwind.config.js` with `content: []`, `@tailwind base; @tailwind components; @tailwind utilities;`, `tailwindcss` as a PostCSS plugin, `tailwindcss` CLI binary.

**Task type:** new setup / existing setup / migration (v3→v4) / debugging.

Completion criterion: version + pipeline + task type are each pinned.

## Phase 3: Implement

Common operations (v4 unless noted):

- **Utilities:** apply utility classes directly in markup; no config needed for built-ins.
- **Responsive states:** use `sm:` `md:` `lg:` `xl:` `2xl:` variants; default breakpoints are mobile-first.
- **Dark mode:** v4 has no `darkMode` config key. Define a custom variant:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
  Then use `dark:` utilities and toggle the `.dark` class on a parent (typically `<html>`).
- **Theme variables:** extend design tokens in `@theme`:
  ```css
  @theme {
    --color-brand: oklch(0.7 0.15 200);
    --spacing-section: 6rem;
  }
  ```
  Tokens become utilities (`bg-brand`, `p-section`).
- **Custom utilities:** define with `@utility`:
  ```css
  @utility content-auto { content-visibility: auto; }
  ```
- **Custom variants:** `@custom-variant` (see dark mode) or `@variant` for a one-off.
- **Source registration:** register scan paths with `@source` (see Phase 4). Required when classes live outside auto-detected roots (e.g. a vendored UI library in `node_modules` that is gitignored).
- **Component styling:** prefer utilities in markup; use `@apply` inside component CSS only when markup-level utilities are impractical, and never inside a pipeline that breaks on it (see Pitfalls).

**Operational rule — Utility vs Inline Styles:**

Prefer Tailwind utility composition over inline styles for ordinary UI styling.

Use inline styles primarily when values are genuinely runtime-dynamic or when bridging dynamic values through CSS custom properties.

**Operational rule — Respect Existing Theme Tokens:**

Before introducing arbitrary values or custom CSS for reusable design values, inspect the project's existing Tailwind theme variables and reuse or extend them when appropriate.

Completion criterion: the intended utility/variant renders and the build exits 0.

## Phase 4: Protect v4 Semantics

v4 is CSS-first and diverges from v3 muscle memory. Watch for:

- Do **not** assume `tailwind.config.js` is required in v4. It is optional; configuration lives in CSS by default.
- Do **not** blindly add `content: []` — that is v3. v4 auto-detects sources from the project root (respecting `.gitignore`).
- Use CSS-first configuration (`@theme`, `@utility`, `@source`, `@custom-variant`) where appropriate.
- Recognize v4 directives: `@import "tailwindcss"`, `@theme`, `@utility`, `@source`, `@variant`, `@custom-variant`, `@apply`, `@screen`.
- v4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+). If older support is needed, stay on v3.4.
- Default ring width changed to `1px` (`ring` ≠ v3's `3px`); renamed scales: `shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden` (new `outline-none` = truly none), `ring`→`ring-3`.
- Removed `@tailwind` directives; use `@import "tailwindcss";`.

Completion criterion: no v3-era constructs (`@tailwind base`, `content: []`, `tailwindcss` PostCSS plugin) appear in a v4 project unless intentionally migrating.

## Phase 5: The Dynamic-Class Hard Rule

Tailwind scans source as **plain text**. It cannot see string concatenation or interpolation. This fails silently:

```jsx
// WRONG — "text-red-600" / "text-green-600" never appear as complete tokens
<div className={`text-${error ? 'red' : 'green'}-600`} />
```

```jsx
// WRONG — bg-blue-600 never appears as a complete token
function Button({ color }) {
  return <button className={`bg-${color}-600 hover:bg-${color}-500`} />;
}
```

Correct: map inputs to complete static class strings:

```jsx
function Button({ color }) {
  const variants = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    red: "bg-red-500 hover:bg-red-400 text-white",
    yellow: "bg-yellow-300 hover:bg-yellow-400 text-black",
  };
  return <button className={variants[color]} />;
}
```

Treat this as a lint rule. In any generated or reviewed code, flag dynamic class construction and rewrite it to static maps. If a class genuinely cannot be known statically, use `@source inline("...")` to safelist it (see `references/v4-core-reference.md`).

Completion criterion: every utility class used at runtime exists as a complete token in source, or is explicitly safelisted via `@source inline()`.

## Phase 6: Verify

For every Tailwind change, run this loop:

1. Inspect existing setup (Phase 1/2).
2. Modify the smallest coherent surface.
3. Run the project's existing build (`npm run build` or the framework's build).
4. Run the Tailwind compilation if it is a separate step (CLI `--watch` build, Vite dev server, PostCSS).
5. Inspect build errors; resolve before proceeding.
6. Verify the expected utility exists in the emitted CSS (grep the output file or read the dev-served CSS).
7. Run project tests / typecheck where relevant.

Completion criterion: build exits 0, the target utility is present in emitted CSS, and relevant tests/typecheck pass.

## Quick Reference

Install + build per pipeline (run with the detected package manager; npm shown):

**Vite (v4):**
```bash
npm install tailwindcss @tailwindcss/vite
```
```js
// vite.config.js
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [tailwindcss()] };
```
```css
/* src/input.css */
@import "tailwindcss";
```

**PostCSS (v4):**
```bash
npm install tailwindcss @tailwindcss/postcss
```
```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```
```css
@import "tailwindcss";
```

**CLI (v4, new/static):**
```bash
npm install tailwindcss @tailwindcss/cli
```
```bash
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

**v3→v4 upgrade tool:**
```bash
npx @tailwindcss/upgrade
```
Run on a fresh branch; review the diff; test in browser. Requires Node 20+.

Frame all of these through the `terminal` tool with a generous `timeout` for installs.

## Pitfalls

- ❌ Replacing a working Vite/PostCSS integration with the CLI — preserve architecture.
- ❌ Dynamic class names (`bg-${c}-600`) — silent no-style bugs; map to static.
- ❌ Assuming `tailwindcss` is still a PostCSS plugin in v4 — it moved to `@tailwindcss/postcss`.
- ❌ Adding `content: []` or `@tailwind` directives in a v4 project.
- ❌ `@apply` with non-utility rules — `@apply` only works with utility classes and breaks inside some Sass/Less pipelines; prefer markup utilities.
- ❌ Forgetting Tailwind ignores `node_modules` and `.gitignore`d paths by default — use `@source` for vendored class sources.
- ❌ Using Play CDN in anything meant to ship.
- ❌ Shipping v4 to browsers older than Safari 16.4 / Chrome 111 / Firefox 128.

## References

- `references/docs-index.md` — navigation + source inventory: URL, topic, relevance, which local reference holds extracted knowledge.
- `references/v4-core-reference.md` — v4 CSS-first config, directives, dark mode, source registration, safelisting.
- `references/directives-and-functions.md` — all v4 directives: `@import`, `@theme`, `@layer`, `@utility`, `@custom-variant`, `@variant`, `@source`, `@apply`, `@media`/`@supports`/`@starting-style`/`@slot`.

Additional reference files are created organically as docs justify them (e.g. `installation-and-build.md`, `source-detection.md`, `theme-and-configuration.md`, `utilities-and-values.md`, `variants-and-states.md`, `responsive-design.md`, `compatibility-and-browser-support.md`, `migration-v3-v4.md`, `troubleshooting.md`). The skill does not mandate a fixed taxonomy up front.

## Documentation Ingestion Contract

When ingesting a new Tailwind documentation page into this skill:

1. **Read the page completely** — fetch the full content, not a summary.
2. **Compare against the existing skill** — identify what is already covered.
3. **Extract only information supported by that page** — no outside knowledge.
4. **Classify each finding**:
   - **Operational rule** → merge into `SKILL.md` (When to Use, Authority Order, Detect/Classify, Implement, Failure Modes, Verification)
   - **Durable technical knowledge** → merge into the appropriate `references/*.md` (create if it doesn't exist)
   - **Navigation/source metadata** → update `references/docs-index.md`
   - **Duplicate/no new information** → no change
5. **Merge, don't append** — consolidate into existing sections; avoid duplicate or overlapping prose.
6. **Preserve contradictions** — if the page conflicts with existing skill content, note the conflict and the source URLs on both sides; do not silently overwrite. Resolve only from a higher-authority source (installed version, live build, newer official docs).
7. **Record the source URL** beside implementation-sensitive facts (e.g. directive syntax, browser requirements, renamed utilities).
8. **Post-ingestion check**:
   - No duplicate guidance across SKILL.md and references
   - No conflicting guidance
   - No stale v3 assumptions in a v4 context
   - SKILL.md has not grown excessively (target ~200 lines; bulk goes to references)
   - Cross-references between SKILL.md and references resolve
9. **Report exactly what changed and why** — one summary per ingestion.

Design principle: **Progressively compile the Tailwind docs into agent-operational knowledge, not mirror the Tailwind website.**

## Single-Page Ingestion Boundary

When the task is "Ingest this Tailwind page":

- Extract **only** claims supported by the supplied page.
- External sources (MDN, caniuse, Lightning CSS site, etc.) may be consulted **only to verify or clarify** a claim from the page.
- If external sources are used:
  - Mark them explicitly as **supplemental** in the reference file.
  - Do not let them override the supplied page silently.
  - Do not expand the reference with unrelated facts from those sources.
  - Record why the extra source was consulted.
- A Tailwind doc page may link to external sites (e.g. Motion, caniuse). Treat those links as doc references, NOT ingestion sources — do not fetch or merge them unless explicitly instructed to ingest that source.
- The reference file must remain a controlled compilation of Tailwind's docs, not "whatever Hermes found while researching."
