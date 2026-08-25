# Tailwind CSS Agent Skill

A high-fidelity Tailwind CSS skill for AI agents, compiled from official documentation with provenance, version awareness, and verification-oriented workflows.

---

## What This Is

This skill encodes operational Tailwind CSS knowledge for AI agents (Hermes, Claude Code, Codex, etc.). It is not a copy of the documentation — it is a **compiled knowledge model** built by ingesting official Tailwind pages one at a time, extracting only what an agent needs to implement, modify, debug, and verify Tailwind projects correctly.

## Why This Exists

Generic LLM knowledge about Tailwind is stale, version-blind, and hallucination-prone. This skill solves that by:

- **Version-aware** — explicitly targets Tailwind v4 (CSS-first), with v3 migration coverage
- **Provenanced** — every reference file cites its canonical source URL(s)
- **Verification-oriented** — workflows require `build exits 0` + `utility present in emitted CSS` + `tests pass`
- **Ownership-modeled** — each concept has one canonical local owner; no duplicated explanations

## What Makes It Different

| Property | Typical LLM Knowledge | This Skill |
|----------|----------------------|------------|
| **Source** | Training cutoff | Official docs, page-by-page ingestion |
| **Version handling** | Mixed v3/v4 | Explicit v4 (CSS-first); v3 only in migration |
| **Verification** | "Should work" | Build exit code + CSS emission + tests |
| **Dynamic classes** | Often suggests `bg-${color}-600` | Hard rule: complete tokens in source or `@source inline()` |
| **Structure** | Flat or mirrored | Canonical ownership + quick index + cross-links |

## Current Coverage

| Area | Status | Source |
|------|--------|--------|
| Compatibility / browser support | Ingested | https://tailwindcss.com/docs/compatibility |
| v3 → v4 migration | Ingested | https://tailwindcss.com/docs/upgrade-guide |
| Utility-first styling philosophy | Ingested | https://tailwindcss.com/docs/styling-with-utility-classes |
| Variants & states (built-in + custom) | Ingested | https://tailwindcss.com/docs/hover-focus-and-other-states |
| Responsive design & container queries | Ingested | https://tailwindcss.com/docs/responsive-design |
| Dark mode (v4 `@custom-variant`) | Ingested | https://tailwindcss.com/docs/dark-mode |
| Custom styles / directives | Ingested | https://tailwindcss.com/docs/adding-custom-styles |
| Source detection & class scanning | Ingested | https://tailwindcss.com/docs/detecting-classes-in-source-files |
| Theme / configuration (`@theme`) | Ingested | https://tailwindcss.com/docs/theme |
| Colors & opacity | Ingested | https://tailwindcss.com/docs/colors |
| Installation / build pipelines | Ingested | Multiple framework guides |
| Functions & directives reference | Ingested | https://tailwindcss.com/docs/functions-and-directives |

> Status "Ingested" = the canonical source page has been read completely and its operational knowledge extracted into the appropriate reference file(s) under `references/`.

## Installation

```bash
# Clone into your Hermes skills directory
git clone git@github.com:blakee-marcus/tailwindcss-skill.git \
  ~/.hermes/skills/software-development/tailwind-css
```

Or copy the `tailwind-css/` directory directly into your agent's skill search path.

The skill is self-contained: `SKILL.md` + `references/`. No build step, no dependencies.

## Usage

Load the skill in your agent, then use it for any Tailwind task:

- **New project setup** — Vite, PostCSS, CLI, or framework (Next, Nuxt, SvelteKit, etc.)
- **Existing project** — add utilities, theme tokens, dark mode, custom variants, `@source` registration
- **Migration** — v3 → v4 (upgrade tool, directive swap, config → CSS)
- **Debugging** — missing styles, broken builds, class detection issues
- **Review/audit** — PR or generated code touching Tailwind

The skill's `SKILL.md` defines the workflow: **Detect → Classify → Implement → Protect v4 Semantics → Verify**.

## Knowledge Architecture

```
tailwind-css/
├── SKILL.md                    # Agent workflow + rules + phases
├── references/
│   ├── docs-index.md           # Navigation + source inventory + ownership table
│   ├── v4-core-reference.md    # Quick index (syntax snippets → canonical owners)
│   ├── source-detection.md     # OWNS: @source, class scanning, safelisting
│   ├── theme-and-configuration.md  # OWNS: @theme, token namespaces, config
│   ├── directives-and-functions.md # OWNS: @utility, @custom-variant, @variant, @layer, @apply, @import options
│   ├── utilities-and-values.md # OWNS: arbitrary values/properties, utility composition
│   ├── variants-and-states.md  # OWNS: variant behavior (built-in + custom)
│   ├── dark-mode.md
│   ├── colors.md
│   ├── responsive-design.md
│   ├── migration-v3-v4.md
│   ├── installation-and-build.md
│   └── compatibility-and-browser-support.md
```

**Ownership principle:** each concept has exactly one canonical owner. `v4-core-reference.md` is a *quick index* — concise syntax that points to the owner for depth. No file duplicates another's full explanation.

## Contributing / Ingestion Contract

To add a new Tailwind documentation page:

1. **Read the page completely** — fetch full content, not a summary
2. **Compare against existing skill** — identify what is already covered
3. **Extract only information supported by that page** — no outside knowledge
4. **Classify each finding**:
   - Operational rule → merge into `SKILL.md` (When to Use, Authority Order, Phases)
   - Durable technical knowledge → merge into the appropriate `references/*.md` (create if needed)
   - Navigation/source metadata → update `references/docs-index.md`
   - Duplicate/no new information → no change
5. **Merge, don't append** — consolidate into existing sections; avoid duplicate/overlapping prose
6. **Preserve contradictions** — if the page conflicts with existing skill content, note the conflict and source URLs on both sides; do not silently overwrite. Resolve only from a higher-authority source (installed version, live build, newer official docs)
7. **Record the source URL** beside implementation-sensitive facts (directive syntax, browser requirements, renamed utilities)
8. **Post-ingestion check**:
   - No duplicate guidance across files
   - No conflicting guidance
   - No stale v3 assumptions in a v4 context
   - `SKILL.md` stays lean (~200 lines; bulk goes to references)
   - Cross-references resolve
9. **Report exactly what changed and why** — one summary per ingestion

**Design principle:** Progressively compile Tailwind docs into agent-operational knowledge, not mirror the Tailwind website.

## License

MIT — see [LICENSE](LICENSE).

---

*Maintained by Blake Marcus. Built for Hermes Agent.*