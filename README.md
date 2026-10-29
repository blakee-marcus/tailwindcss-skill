# Tailwind CSS Agent Skill

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4">
  <img src="https://skills.sh/b/blakee-marcus/tailwindcss-skill" alt="skills.sh installs">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version 0.1.0">
  <img src="https://img.shields.io/github/license/blakee-marcus/tailwindcss-skill" alt="MIT License">
</p>

**Stop coding agents from writing Tailwind v3 code in your Tailwind v4 projects.**

Coding agents often fall back to outdated Tailwind patterns: `content: []`, `@tailwind` directives, unnecessary config files, and dynamic class names that never make it into generated CSS.

The skill checks the installed Tailwind version and existing build setup before it changes anything, then verifies the generated CSS.

```bash
npx skills add blakee-marcus/tailwindcss-skill
```

## Example

A Vite project already running Tailwind v4. The prompt: *"Add dark mode support."*

**Without the skill**, the agent falls back to v3 memory:

```js
// tailwind.config.js — not loaded automatically in v4
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,jsx}'],
}
```

Unless the project explicitly loads that file with `@config`, those settings never take effect. No error. No dark mode.

**With the skill**, the agent detects v4 + Vite, preserves the existing build setup, and writes CSS-first configuration:

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Markup uses `dark:bg-gray-900`. Build passes. Generated CSS contains the variant.

## What it prevents

| Failure mode | The rule |
|---|---|
| Mixing v3/v4 config | Don't introduce v3-style `content: []` or `@tailwind` directives into a v4 project, and don't assume a JavaScript config file is loaded automatically. |
| Replacing a working integration | Don't swap `@tailwindcss/vite` or `@tailwindcss/postcss` for the CLI just because the CLI is available. |
| Dynamic class construction | Flag `bg-${color}-600` — Tailwind scans source as plain text and never sees the complete token. |
| Arbitrary values over theme tokens | Don't reach for `bg-[#bada55]` when the project already defines `--color-brand`. |
| Unverified changes | Always run the build and confirm the target utility is present in the generated CSS. |

## How it works

1. **Detect** — read `package.json`, lockfile, `vite.config.*`, `postcss.config.*`, CSS entrypoints, and the installed Tailwind version before changing anything.
2. **Classify** — pin version (v3 vs v4), pipeline (Vite / PostCSS / CLI / none), and task type (new / existing / migration / debug).
3. **Implement** — make the smallest change needed using v4 CSS-first directives, without replacing a setup that already works.
4. **Protect v4 semantics** — avoid v3-era constructs unless intentionally migrating.
5. **Verify** — run the build, confirm it exits 0, and verify the target utility is present in the generated CSS.

## Usage

- **New project** — Vite, PostCSS, CLI, or an existing framework-native integration.
- **Existing project** — add utilities, theme tokens, dark mode, custom variants, or `@source` registration.
- **Migration** — v3 → v4 using the `@tailwindcss/upgrade` tool on a fresh branch.
- **Debugging** — missing styles, broken builds, or class-detection issues.
- **Review** — flag dynamic class construction and v3-era constructs in PRs or generated code.

## Source grounding

The skill is grounded in the official Tailwind documentation. `references/docs-index.md` tracks which Tailwind pages support each topic and where that guidance lives in the repository.

## Supported runtimes

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

<details>
<summary>Manual install instructions</summary>

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

</details>

## Repository structure

- **`SKILL.md`** — operational behavior: when to use the skill, the detect→verify workflow, authority order, and failure-mode rules.
- **`references/*.md`** — durable technical knowledge: directive syntax, theme namespaces, variant behavior, source detection, migration steps. Each topic has one main reference file.
- **`references/docs-index.md`** — source tracking and ownership map: which Tailwind URL was ingested, what it covers, and which local file holds it.

## Contributing

To add another official Tailwind documentation page:

1. Read the page in full.
2. Check `references/docs-index.md` for what is already covered.
3. Extract only what the page supports; classify each finding as an operational rule (→ `SKILL.md`) or durable guidance (→ the owning `references/*.md`).
4. Merge into existing sections; update `docs-index.md` with the URL and ownership.
5. Confirm no duplicate or conflicting guidance was introduced.

## License

MIT — see [LICENSE](LICENSE).

---

If this skill saves you from a broken Tailwind setup, consider starring the repository.
