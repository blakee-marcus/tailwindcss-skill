# Tailwind evaluation fixtures

The runner and methodology live in [`../evals/`](../evals/README.md). This directory contains six locked fixtures and the recorded summary—not evidence of a skill uplift yet.

```sh
npm ci --ignore-scripts
npm test
npm run benchmark                         # unmeasured plan; no inference or file writes
npm run benchmark:controls                # real builds: untouched fixture vs manual gold
npm run benchmark:agents                  # real Codex invocation; authentication required
```

`node benchmarks/scoring.js` forwards to the evaluator. Its legacy `--execute` flag forwards to `--agents codex`; it no longer scores unchanged copies as if an agent ran. `node benchmarks/scoring.test.js` runs the actual evaluator test suite, not duplicated helper implementations.

## Six cases

| Fixture | Starting condition | Required result |
|---|---|---|
| `01-v4-dark-mode` | v4 Vite project with light styles | Class-scoped dark background and text, not media-only dark mode |
| `02-dynamic-classes` | Interpolated `bg-${color}-600` | All three complete color classes emitted, labels/layout retained |
| `03-preserve-vite-integration` | Working v4 Vite integration | Blue background without changing packages, Vite config, or scripts |
| `04-v4-postcss` | v4 packages with the old PostCSS plugin name | Correct v4 plugin, emitted green background, original PostCSS command |
| `05-source-detection` | Imported vendor component outside explicit source roots | Register vendor source, no copied class token or safelist |
| `06-v3-stable` | Working v3 PostCSS/Vite project | Blue background while preserving v3, directives, config, and lockfile |

The authoritative task prompts and acceptance checks are in `evals/evaluate.py`. Exact trial prompts are saved outside the fixture as `prompt.txt`; the older `prompts/` files are historical, not inputs to the current runner.

## Recorded state

See [`results/summary.md`](results/summary.md) and [`results/results.json`](results/results.json). Manual gold builds test the evaluator. They are **not** with-skill agent outcomes. Authentication errors and unattempted trials are **not** coding failures or measured comparisons.
