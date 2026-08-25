# Tailwind CSS Agent Skill

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/Agent_Skills-open-6f42c1" alt="Agent Skills">
  <img src="https://skills.sh/b/blakee-marcus/tailwindcss-skill" alt="skills.sh installs">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version 0.1.0">
  <img src="https://img.shields.io/github/license/blakee-marcus/tailwindcss-skill" alt="MIT License">
  <img src="https://img.shields.io/badge/source-official_Tailwind_docs-0ea5e9" alt="Official Tailwind docs">
</p>

An open Agent Skill for Tailwind CSS v4 — version-aware implementation, migration, debugging, and verification. Works with **Claude Code, Cursor, Windsurf, Codex, Hermes Agent, GitHub Copilot, Gemini CLI, and any Agent Skills–compatible runtime**.

## Why this exists

The skill interrupts specific failure modes that `SKILL.md` treats as rules:

- **Mixing v3 and v4 configuration.** Adding `content: []` or `@tailwind` directives to a v4 project, or assuming `tailwind.config.js` is required when it isn't.
- **Replacing a working integration.** Swapping an existing `@tailwindcss/vite` or `@tailwindcss/postcss` setup for the CLI just because the CLI is available.
- **Constructing class names Tailwind cannot discover.** Writing `bg-${color}-600` produces no styles, because Tailwind scans source as plain text and never sees the complete token.
- **Introducing arbitrary values when theme tokens exist.** Reaching for `bg-[#bada55]` when the project already defines `--color-brand` and should extend it instead.
- **Claiming success without verifying emitted CSS.** Reporting a change as done without running the build and confirming the utility is present in the output.

## How it works

The agent follows a fixed workflow defined in `SKILL.md`:

1. **Detect** — read `package.json`, lockfile, `vite.config.*`, `postcss.config.*`, CSS entrypoints, and the installed Tailwind version before touching anything.
2. **Classify** — pin version (v3 vs v4), pipeline (Vite / PostCSS / CLI / none), and task type (new / existing / migration / debug).
3. **Implement** — apply the smallest coherent change using v4 CSS-first directives, preserving the project's existing architecture.
4. **Protect v4 semantics** — avoid v3-era constructs unless intentionally migrating.
5. **Verify** — run the build, confirm it exits 0, and verify the target utility is present in the emitted CSS.

## Example

A repository that already uses Tailwind v4 with a Vite integration.

**Without the skill**, an agent may apply remembered v3 patterns:

```js
// tailwind.config.js — v3 pattern, not used in v4
export default {
  content: ["./src/**/*.{html,js,jsx}"],
}
```

**With the skill**, the agent first detects the installed version and existing build integration. For a v4 project it preserves CSS-first configuration and only introduces explicit source registration (`@source`) when the project's actual source layout requires it — for example, a vendored UI library inside `node_modules` that Tailwind ignores by default.

## Coverage

Every area below is sourced from official Tailwind documentation and compiled into `references/`.

| Area | Status | Source |
|------|--------|--------|
| Compatibility / browser support | Ingested | https://tailwindcss.com/docs/compatibility |
| v3 → v4 migration | Ingested | https://tailwindcss.com/docs/upgrade-guide |
| Utility-first styling | Ingested | https://tailwindcss.com/docs/styling-with-utility-classes |
| Variants & states | Ingested | https://tailwindcss.com/docs/hover-focus-and-other-states |
| Responsive design & container queries | Ingested | https://tailwindcss.com/docs/responsive-design |
| Dark mode (v4 `@custom-variant`) | Ingested | https://tailwindcss.com/docs/dark-mode |
| Custom styles / directives | Ingested | https://tailwindcss.com/docs/adding-custom-styles |
| Source detection & class scanning | Ingested | https://tailwindcss.com/docs/detecting-classes-in-source-files |
| Theme / configuration (`@theme`) | Ingested | https://tailwindcss.com/docs/theme |
| Colors & opacity | Ingested | https://tailwindcss.com/docs/colors |
| Installation / build pipelines | Ingested | https://tailwindcss.com/docs/installation/using-vite and related |
| Functions & directives | Ingested | https://tailwindcss.com/docs/functions-and-directives |

Status "Ingested" means the canonical page was read in full and its operational knowledge was merged into the appropriate reference file.

## Installation

The repository root **is** the skill. There is no nested `tailwind-css/` folder inside the repository. It follows the [Agent Skills](https://agentskills.io/specification) open standard, so the same directory installs into any compatible runtime.

### One command — works everywhere (recommended)

```bash
npx skills add blakee-marcus/tailwindcss-skill
```

This installs the skill to `~/.agents/skills/tailwind-css` and automatically symlinks it into **Claude Code, Hermes Agent, Codex, Cursor, Windsurf, GitHub Copilot, Gemini CLI, OpenCode, and 70+ other agents** — no further steps.

<details>
<summary>Per-runtime manual install (only if skills.sh isn't an option)</summary>

### Hermes Agent

```bash
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  ~/.hermes/skills/software-development/tailwind-css
```

### Claude Code — personal

```bash
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  ~/.claude/skills/tailwind-css
```

The destination directory name `tailwind-css` matches the skill's `name` field.

### Claude Code — project

```bash
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  .claude/skills/tailwind-css
```

### Claude Code — plugin

The repo ships a `.claude-plugin/plugin.json` manifest, so it also loads as a single-skill plugin without restructuring:

```bash
claude --plugin-dir /path/to/tailwindcss-skill
```

### Other Agent Skills clients

Any runtime that implements the Agent Skills standard can load this directory directly. After cloning, the directory contains `SKILL.md`, `README.md`, `LICENSE`, and `references/`. No build step or dependencies are required.

</details>

## Supported Runtimes

|| Agent | Install | Behavior | Notes ||
|-------|-------|----------|----------|-------|
| **skills.sh (universal)** | ✅ Verified | ✅ Verified | `npx skills add blakee-marcus/tailwindcss-skill` — installs to `~/.agents/skills/tailwind-css`, symlinks to all supported agents |
| **Claude Code** | ✅ Verified | ✅ Verified | Personal (`~/.claude/skills/tailwind-css`), project (`.claude/skills/tailwind-css`), or plugin (`.claude-plugin/`) |
| **Hermes Agent** | ✅ Verified | ✅ Verified | `~/.hermes/skills/software-development/tailwind-css` |
| **Codex** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path; first-class skills support in Codex app |
| **Cursor** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path |
| **Windsurf** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path |
| **GitHub Copilot** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path |
| **Gemini CLI** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path |
| **OpenCode** | ✅ Verified | ⏳ Pending | Installed via skills.sh universal path |
| **Generic Agent Skills** | ✅ Verified | ⏳ Pending | Any Agent Skills–compatible runtime can load the directory directly |

## Usage

Load the skill, then ask for any Tailwind task:

- **New project setup** — Vite, PostCSS, CLI, or an existing framework-native integration.
- **Existing project** — add utilities, theme tokens, dark mode, custom variants, or `@source` registration.
- **Migration** — v3 → v4, using the `@tailwindcss/upgrade` tool on a fresh branch.
- **Debugging** — missing styles, broken builds, or class-detection issues.
- **Review** — flag dynamic class construction and v3-era constructs in PRs or generated code.

## Quick Demo Scenarios

These are the fastest way to see the skill's value. Each is a one-prompt task that would silently fail without the skill's rules.

### 1. v3→v4 Mistake Prevention
> "Add dark mode to this Tailwind v4 project."

**Without skill:** Agent adds `darkMode: 'class'` to `tailwind.config.js` (v3 pattern) — does nothing in v4, no error.
**With skill:** Agent detects v4, sees no `tailwind.config.js` is required, and adds the correct v4 CSS-first variant:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Then uses `dark:bg-gray-900` in markup.

### 2. Dynamic-Class Detection
> "Create a Button component that takes a `color` prop and styles itself."

**Without skill:** Generates `className={`bg-${color}-600 hover:bg-${color}-500`}` — Tailwind never sees complete tokens, styles vanish silently.
**With skill:** Flags the pattern, rewrites to a static map:
```jsx
const variants = {
  blue: "bg-blue-600 hover:bg-blue-500 text-white",
  red: "bg-red-500 hover:bg-red-400 text-white",
};
return <button className={variants[color]} />;
```

### 3. Preserving Vite/PostCSS Architecture
> "Set up Tailwind in this Vite project."

**Without skill:** Installs `tailwindcss` + `autoprefixer`, adds PostCSS config with `tailwindcss` plugin — v3 pattern, wrong for v4, breaks the existing Vite integration.
**With skill:** Detects Vite project, installs `tailwindcss @tailwindcss/vite`, adds plugin to `vite.config.js`, uses `@import "tailwindcss"` in CSS. Architecture preserved.

## Repository structure

- **`SKILL.md`** — operational behavior: when to use the skill, the detect→verify workflow, authority order, and failure-mode rules.
- **`references/*.md`** — durable technical knowledge: directive syntax, theme namespaces, variant behavior, source detection, migration steps. Each topic has one canonical owner file.
- **`references/docs-index.md`** — source provenance and the ownership map: which Tailwind URL was ingested, what it covers, and which local file holds it.

`references/v4-core-reference.md` is a quick index — concise syntax that points to the canonical owner for depth.

## Documentation ingestion model

New Tailwind pages are added through a controlled contract:

- **Single-page boundary.** One documentation page is ingested at a time. Only claims the page itself supports are extracted; external links are treated as references, not ingestion sources.
- **Merge, not append.** New information is consolidated into existing sections. The skill does not grow by stacking duplicate prose.
- **Canonical local ownership.** Each concept has exactly one owner file. Other files summarize or cross-link; none duplicate the full explanation.
- **Provenance.** Every reference file records the source URL behind implementation-sensitive facts (directive syntax, browser requirements, renamed utilities).
- **Conflict handling.** If a new page contradicts existing content, both sides and their source URLs are noted. Resolution follows authority order: installed version, live build, then newer official docs — never silent overwrite.

## Contributing

To add another official Tailwind documentation page:

1. Read the page in full.
2. Check `references/docs-index.md` for what is already covered.
3. Extract only what the page supports; classify each finding as an operational rule (→ `SKILL.md`) or durable knowledge (→ the owning `references/*.md`).
4. Merge into existing sections; update `docs-index.md` with the URL and ownership.
5. Confirm no duplicate or conflicting guidance was introduced.

## License

MIT — see [LICENSE](LICENSE).