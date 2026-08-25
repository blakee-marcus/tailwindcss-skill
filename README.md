# Tailwind CSS Agent Skill

A version-aware Tailwind CSS skill that makes an AI agent detect the project's real setup, respect v4 semantics, and verify the CSS it generates — instead of guessing from stale training memory.

- **Tailwind v4 aware** — CSS-first configuration (`@import "tailwindcss"`, `@theme`, `@utility`, `@source`) is the default mental model; v3 is covered only where migration requires it.
- **Official-doc grounded** — knowledge is compiled from Tailwind's own documentation page by page, with source URLs recorded per topic.
- **Detects before editing** — inspects the installed version, build pipeline, and framework before changing anything.
- **Prevents stale v3 assumptions** — guards against `content: []`, `tailwind.config.js`-required thinking, and the old PostCSS plugin in v4 projects.
- **Verifies generated output** — requires a clean build and confirmation that the target utility exists in the emitted CSS.
- **Built for agent use** — a workflow, not a copy of the documentation.

## Why this exists

An LLM asked about Tailwind tends to reach for patterns it half-remembers. Those patterns fail silently or visibly in real projects. This skill exists to interrupt the common failure modes that `SKILL.md` treats as rules:

- **Mixing v3 and v4 configuration.** Adding `content: []` or `@tailwind` directives to a v4 project, or assuming `tailwind.config.js` is required when it isn't.
- **Replacing a working integration unnecessarily.** Swapping an existing `@tailwindcss/vite` or `@tailwindcss/postcss` setup for the CLI just because the CLI is available.
- **Constructing class names Tailwind cannot discover.** Writing `bg-${color}-600` or `text-${state}-600` produces no styles, because Tailwind scans source as plain text and never sees the complete token.
- **Introducing arbitrary values when theme tokens already exist.** Reaching for `bg-[#bada55]` when the project already defines `--color-brand` and should extend it instead.
- **Claiming success without verifying emitted CSS.** Reporting a change as done without running the build and confirming the utility is present in the output.

## What the skill does

The agent follows a fixed workflow defined in `SKILL.md`:

1. **Detect** — read `package.json`, lockfile, `vite.config.*`, `postcss.config.*`, CSS entrypoints, and the installed Tailwind version before touching anything.
2. **Classify** — pin version (v3 vs v4), pipeline (Vite / PostCSS / CLI / none), and task type (new / existing / migration / debug).
3. **Implement** — apply the smallest coherent change using v4 CSS-first directives, preserving the project's existing architecture.
4. **Protect v4 semantics** — avoid v3-era constructs unless intentionally migrating.
5. **Verify** — run the build, confirm it exits 0, and grep the emitted CSS for the target utility.

## Example

A repository that already uses Tailwind v4 with a Vite integration.

**Without the skill**, an agent may apply remembered v3 patterns:

```js
// tailwind.config.js — wrong for a v4 project
export default {
  content: ["./src/**/*.{html,js,jsx}"],
}
```

**With the skill**, the agent first detects the installed version and existing build integration. For a v4 project it preserves CSS-first configuration and only introduces explicit source registration (`@source`) when the project's actual source layout requires it — for example, a vendored UI library inside `node_modules` that Tailwind ignores by default.

## Coverage

Every area below has been read from its canonical Tailwind page and extracted into `references/`.

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

The repository root **is** the skill. There is no nested `tailwind-css/` folder inside the repository.

```bash
git clone git@github.com:blakee-marcus/tailwind-css-skill.git \
  ~/.hermes/skills/software-development/tailwind-css
```

After cloning, the directory `~/.hermes/skills/software-development/tailwind-css` contains `SKILL.md`, `README.md`, `LICENSE`, and `references/`. No build step or dependencies are required.

This skill is written in the Hermes Agent skill format. It is designed to be loaded by Hermes Agent.

## Usage

Load the skill, then ask for any Tailwind task:

- **New project setup** — Vite, PostCSS, CLI, or a framework (Next, Nuxt, SvelteKit, etc.)
- **Existing project** — add utilities, theme tokens, dark mode, custom variants, or `@source` registration
- **Migration** — v3 → v4, using the `@tailwindcss/upgrade` tool on a fresh branch
- **Debugging** — missing styles, broken builds, or class-detection issues
- **Review** — flag dynamic class construction and v3-era constructs in PRs or generated code

## Knowledge architecture

- **`SKILL.md`** — operational behavior: when to use the skill, the detect→verify workflow, authority order, and failure-mode rules.
- **`references/*.md`** — durable technical knowledge: directive syntax, theme namespaces, variant behavior, source detection, migration steps. Each topic has one canonical owner file.
- **`references/docs-index.md`** — source provenance and the ownership map: which Tailwind URL was ingested, what it covers, and which local file holds it.

`references/v4-core-reference.md` is a quick index — concise syntax that points to the canonical owner for depth, rather than duplicating it.

## Documentation ingestion model

New Tailwind pages are added through a controlled contract, which is what keeps the knowledge trustworthy:

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
