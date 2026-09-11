# Tailwind CSS Agent Skill

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/Agent_Skills-open-6f42c1" alt="Agent Skills">
  <img src="https://skills.sh/b/blakee-marcus/tailwindcss-skill" alt="skills.sh installs">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version 0.1.0">
  <img src="https://img.shields.io/github/license/blakee-marcus/tailwindcss-skill" alt="MIT License">
</p>

**Stop coding agents from writing Tailwind v3 code in your Tailwind v4 projects.**

AI agents mix Tailwind versions. They add `content: []`, `@tailwind` directives, and `tailwind.config.js` to v4 projects that don't use them. The result is silent breakage — missing styles, wrong configuration, and builds that pass without emitting the utilities you asked for.

This skill reads the project's actual Tailwind version and build pipeline before changing anything, then verifies the emitted CSS.

```bash
npx skills add blakee-marcus/tailwindcss-skill
```

## Proof

A Vite project already running Tailwind v4. The prompt: *"Add dark mode support."*

**Without the skill**, the agent falls back to v3 memory:

```js
// tailwind.config.js — v3 pattern, silently ignored in v4
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,jsx}'],
}
```

The file does nothing in v4. No error. No dark mode.

**With the skill**, the agent detects v4 + Vite, preserves the existing architecture, and writes CSS-first configuration:

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Markup uses `dark:bg-gray-900`. Build passes. Emitted CSS contains the variant.

## What it prevents

| Failure mode | The rule |
|---|---|
| Mixing v3/v4 config | Never add `content: []`, `@tailwind` directives, or `tailwind.config.js` to a v4 project unless migration is the explicit task. |
| Replacing a working integration | Don't swap `@tailwindcss/vite` or `@tailwindcss/postcss` for the CLI just because the CLI is available. |
| Dynamic class construction | Flag `bg-${color}-600` — Tailwind scans source as plain text and never sees the complete token. |
| Arbitrary values over theme tokens | Don't reach for `bg-[#bada55]` when the project already defines `--color-brand`. |
| Unverified changes | Always run the build and confirm the target utility is present in emitted CSS. |

## How it works

1. **Detect** — read `package.json`, lockfile, `vite.config.*`, `postcss.config.*`, CSS entrypoints, and the installed Tailwind version before touching anything.
2. **Classify** — pin version (v3 vs v4), pipeline (Vite / PostCSS / CLI / none), and task type (new / existing / migration / debug).
3. **Implement** — apply the smallest coherent change using v4 CSS-first directives, preserving the project's existing architecture.
4. **Protect v4 semantics** — avoid v3-era constructs unless intentionally migrating.
5. **Verify** — run the build, confirm it exits 0, and verify the target utility is present in the emitted CSS.

## Installation

```bash
npx skills add blakee-marcus/tailwindcss-skill
```

Manual installs:

```bash
# Hermes Agent
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  ~/.hermes/skills/software-development/tailwind-css

# Claude Code — personal
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  ~/.claude/skills/tailwind-css

# Claude Code — project
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  .claude/skills/tailwind-css

# Claude Code — plugin
claude --plugin-dir /path/to/tailwindcss-skill
```

## Supported Runtimes

| Runtime | Install path | Verified |
|---|---|---|
| Hermes Agent | Manual clone | ✅ |
| Claude Code | skills.sh, manual clone, or plugin | Not yet |
| Codex | skills.sh | Not yet |
| Cursor | skills.sh | Not yet |
| Windsurf | skills.sh | Not yet |
| GitHub Copilot | skills.sh | Not yet |
| Gemini CLI | skills.sh | Not yet |
| OpenCode | skills.sh | Not yet |

## Usage

- **New project** — Vite, PostCSS, CLI, or an existing framework-native integration.
- **Existing project** — add utilities, theme tokens, dark mode, custom variants, or `@source` registration.
- **Migration** — v3 → v4 using the `@tailwindcss/upgrade` tool on a fresh branch.
- **Debugging** — missing styles, broken builds, or class-detection issues.
- **Review** — flag dynamic class construction and v3-era constructs in PRs or generated code.

## Coverage

Every area is sourced from official Tailwind documentation and compiled into `references/`. "Ingested" means the canonical page was read in full and its operational knowledge was merged into the appropriate reference file.

| Area | Source |
|---|---|
| Compatibility / browser support | [tailwindcss.com/docs/compatibility](https://tailwindcss.com/docs/compatibility) |
| v3 → v4 migration | [tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide) |
| Utility-first styling | [tailwindcss.com/docs/styling-with-utility-classes](https://tailwindcss.com/docs/styling-with-utility-classes) |
| Variants & states | [tailwindcss.com/docs/hover-focus-and-other-states](https://tailwindcss.com/docs/hover-focus-and-other-states) |
| Responsive design & container queries | [tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design) |
| Dark mode (v4 `@custom-variant`) | [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) |
| Custom styles / directives | [tailwindcss.com/docs/adding-custom-styles](https://tailwindcss.com/docs/adding-custom-styles) |
| Source detection & class scanning | [tailwindcss.com/docs/detecting-classes-in-source-files](https://tailwindcss.com/docs/detecting-classes-in-source-files) |
| Theme / configuration (`@theme`) | [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) |
| Colors & opacity | [tailwindcss.com/docs/colors](https://tailwindcss.com/docs/colors) |
| Installation / build pipelines | [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) and related |
| Functions & directives | [tailwindcss.com/docs/functions-and-directives](https://tailwindcss.com/docs/functions-and-directives) |

## Repository structure

- **`SKILL.md`** — operational behavior: when to use the skill, the detect→verify workflow, authority order, and failure-mode rules.
- **`references/*.md`** — durable technical knowledge: directive syntax, theme namespaces, variant behavior, source detection, migration steps. Each topic has one canonical owner file.
- **`references/docs-index.md`** — source provenance and ownership map: which Tailwind URL was ingested, what it covers, and which local file holds it.

## Contributing

To add another official Tailwind documentation page:

1. Read the page in full.
2. Check `references/docs-index.md` for what is already covered.
3. Extract only what the page supports; classify each finding as an operational rule (→ `SKILL.md`) or durable knowledge (→ the owning `references/*.md`).
4. Merge into existing sections; update `docs-index.md` with the URL and ownership.
5. Confirm no duplicate or conflicting guidance was introduced.

## License

MIT — see [LICENSE](LICENSE).
