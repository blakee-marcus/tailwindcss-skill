# Benchmarks

Reproducible evidence that the `tailwindcss-skill` improves Tailwind v4 agent behavior.

This directory holds the benchmark fixtures, scorer, and raw results. Everything here is inspectable — runs and results are committed so third parties can verify the evidence directly.

## Layout

```
benchmarks/
├── README.md           # this file
├── scoring.js          # deterministic scorer + self-tests
├── scoring.test.js     # test runner for scoring functions
├── fixtures/           # 5 Tailwind v4 scenarios
│   ├── 01-v4-dark-mode/
│   ├── 02-dynamic-classes/
│   ├── 03-preserve-vite-integration/
│   ├── 04-v4-postcss/
│   └── 05-source-detection/
├── prompts/            # exact prompts given to the agent
├── runs/               # raw agent output (baseline + with-skill)
│   ├── baseline/
│   └── with-skill/
└── results/            # structured results and summary
    ├── results.json
    └── summary.md
```

## How to run

```bash
node benchmarks/scoring.js                  # dry-run validation
node benchmarks.scoring.test.js             # scorer self-tests
node benchmarks/scoring.js --execute        # run actual benchmark (requires agent runtime)
```

## Scoring criteria

Each run produces pass/fail on seven check types. A fixture passes only when **all** its checks pass.

| Check | What it verifies | How |
|---|---|---|
| `build` | Project builds and exits 0 | `npm run build` in the fixture directory |
| `no_v3_config` | No v3 constructs that aren't explicitly loaded via `@config` | Detects `tailwind.config.*` files, `@tailwind` base/components/utilities directives, and `content: []` in CSS — ignores a config file that is explicitly loaded via `@config` |
| `expected_css_generated` | Target utility/variant selector is present in emitted CSS | Searches `dist/assets/*.css` or `dist/index.css` for exact selectors |
| `integration_preserved` | Existing `@tailwindcss/vite` not replaced | Checks `package.json` devDependencies |
| `no_dynamic_classes` | No string-interpolated classNames | Recursively scans `src/` for `${...}` inside className attributes |
| `correct_v4_package` | Uses `@tailwindcss/vite` or `@tailwindcss/postcss` | Checks `package.json` for the correct v4 package |
| `source_detected` | `@source` directive used when needed | Scans `src/*.css` for `@source` |

## Per-fixture check matrix

| Fixture | build | no_v3_config | expected_css | integration_preserved | no_dynamic | correct_v4 | source_detected |
|---|---|---|---|---|---|---|---|
| 01-v4-dark-mode | ✓ | ✓ | ✓ (`.dark .dark\\:bg-`) | ✓ | | | |
| 02-dynamic-classes | ✓ | | ✓ (`.bg-blue-600`) | | ✓ | | |
| 03-preserve-vite | ✓ | ✓ | | ✓ | | | |
| 04-v4-postcss | ✓ | ✓ | ✓ (`.bg-green-500`) | | | ✓ (`@tailwindcss/postcss`) | |
| 05-source-detection | ✓ | ✓ | ✓ (`.text-emerald-600`) | | | | ✓ |

## Self-tests

`scoring.test.js` proves each check function:
- **Passes** the unmodified fixture (valid input)
- **Fails** a targeted mutation (invalid input)

Run with `node benchmarks/scoring.test.js`. All tests must pass before the scorer is used for benchmark execution.

## Results

After running the benchmark suite:

- `benchmarks/results/results.json` — structured per-run results
- `benchmarks/results/summary.md` — human-readable summary
- `benchmarks/runs/baseline/` and `benchmarks/runs/with-skill/` — raw agent output and build artifacts
