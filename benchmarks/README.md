# Tailwind CSS Agent Skill — Benchmark Suite

Reproducible evidence that the `tailwindcss-skill` improves Tailwind v4 agent behavior.

## How to run

```bash
node benchmarks/scoring.js
```

## What it does

1. Prompts a coding agent to complete the same Tailwind task twice — once **without** the skill, once **with** it.
2. Builds the resulting project.
3. Runs deterministic checks on the output (no v3 leakage, expected utilities emitted, existing integration preserved).
4. Writes structured results to `benchmarks/results/results.json` and a human-readable summary to `benchmarks/results/summary.md`.

## Fixtures

| # | Name | Starting condition | Prompt |
|---|---|---|---|
| 01 | v4 Dark Mode | Tailwind v4 + Vite | Add class-based dark mode support |
| 02 | Dynamic Classes | Tailwind v4 + Vite | Fix the component so all Tailwind styles are reliably generated |
| 03 | Preserve Vite Integration | Tailwind v4 + `@tailwindcss/vite` | Make a Tailwind change without touching the build |
| 04 | v4 PostCSS | PostCSS project, Tailwind v4 requirement | Configure Tailwind through PostCSS |
| 05 | Source Detection | Tailwind v4 + Vite, utility outside detected source | Fix the missing Tailwind styles without duplicating classes |

## Scoring criteria

Each run produces pass/fail on these checks:

- `build` — project builds and exits 0
- `no_v3_config` — no `content: []`, `@tailwind` directives, or `tailwind.config.js` added to a v4 project
- `expected_css_generated` — the target utility/variant appears in emitted CSS
- `integration_preserved` — existing build integration is not replaced
- `no_dynamic_classes` — no string-interpolated class names
- `correct_v4_package` — uses `@tailwindcss/vite` or `@tailwindcss/postcss` for v4
- `source_detected` — `@source` used when needed

A fixture passes if **all** checks pass.

## Results

After running the suite:

- `benchmarks/results/results.json` — structured per-run results
- `benchmarks/results/summary.md` — human-readable summary
- `benchmarks/runs/baseline/` and `benchmarks/runs/with-skill/` — raw agent output and build artifacts
