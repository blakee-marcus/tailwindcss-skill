# Reproducible Tailwind evaluation

This harness separates **evaluator validation** from **agent comparison**. A correct manual solution proves a fixture and its checks can work; it does not prove a skill improves an agent.

Current evidence: [recorded results](../benchmarks/results/summary.md).

## CI and measured-agent separation

Pull requests and pushes to main run evaluator regression tests and six paired fixture controls in `.github/workflows/benchmark-validation.yml`. These are real CSS builds, **not** model results. Authenticated Codex comparisons must be run explicitly and their outputs reviewed before publishing any effectiveness claim.

## Requirements and commands

Python 3.11+, Node/npm, and the pinned root dependencies:

```sh
npm ci --ignore-scripts
npm test
npm run benchmark                       # plan only, no model calls or result writes
npm run benchmark:controls              # six negative/manual-gold build pairs
npm run benchmark:agents                # six requested Codex pairs, stops on auth failure
```

A focused trial is available:

```sh
python3 evals/evaluate.py --controls --case 06-v3-stable
python3 evals/evaluate.py --agents codex --case 01-v4-dark-mode --agent-timeout 180
```

`--model MODEL` is an optional per-invocation override; otherwise both conditions inherit the same existing Codex model configuration. No global routing or authentication settings are edited. The configured model is recorded separately from an actual responding model; authentication failure does not establish which model would have responded.

Output defaults to a new directory under `~/.hermes/cache/scratch/`. Set `HERMES_EVAL_SCRATCH` to another scratch directory, or pass a new/empty `--output /absolute/path`. Output inside this repository is rejected: prompts, logs, sibling solutions and generated result JSON must not contaminate Tailwind's source scanning. Copy reviewed reports into the versioned results directory deliberately; the runner never replaces historical results automatically.

Exit codes: **0** checks passed; **1** a measured candidate/control failed; **2** comparison incomplete or blocked. Never pipe an install/build through `tail` and use the pipeline's exit as the command's result.

## What is held constant

Each condition starts from a fresh, identically hashed fixture and lockfile, installed using `npm ci --ignore-scripts --no-audit --no-fund`. The same task, allowed replacement paths, structured-output schema, configured model, timeout and acceptance checks apply to both conditions. There is one trial per condition, not a statistical sample.

For the treatment only, the repository's exact `SKILL.md` and `references/` are copied into `.agents/skills/tailwind-css/`, Codex's native project skill location. Both conditions receive the identical instruction to use that directory if it exists. File hashes identify the delivered skill. Delivery is not evidence of invocation: inspect the raw agent command trace to establish the skill was actually read before attributing any outcome to it.

The task asks the agent to read and propose complete replacement files as JSON, not to modify the project itself. The evaluator validates all proposed paths before applying any replacement, rejects traversal/duplicates/symlinks/oversized files, and then independently builds and scores. This is a bounded **proposal-style coding evaluation**, not an unrestricted autonomous-editing benchmark. Existing CLI sandbox and approval policy are inherited; the runner supplies no sandbox/approval bypass flags.

The runner currently supports **Codex**. Claude Code's native behavioral validation is still unverified and blocked by missing sign-in; a Claude driver is not implemented. An installed binary or a successful auth-status command is not a successful model invocation.

## Acceptance evidence

- Fresh real build exit code, preserved independently of output formatting.
- Generated CSS artifact paths and SHA-256 hashes.
- CSS parsed with PostCSS and a selector parser: comments, attribute strings and declarations containing class-looking text do not count as utility selectors.
- Required declarations on exact utility classes, including `.dark` scope instead of media-only dark mode.
- Preserved layout utility selectors.
- Unchanged files outside each case's small edit allowlist: dependency manifest, lockfile, build scripts, Vite setup, v3 config and vendor component remain protected where appropriate.
- Additional dynamic-color, vendor-registration and v3-version checks.

The source-detection case deliberately limits v4 scanning to application source and its HTML entry. The imported vendor heading is outside those roots; its utility is absent until that source is registered. Explicit roots also prevent the skill text itself from supplying utility tokens during treatment builds.

`gold.json` contains manually authored complete-file corrections. They are labeled `manual-gold`; untouched fixtures are labeled `negative-control`. Neither is labeled baseline agent output or with-skill agent output.

## Evidence files and limits

Each run directory retains `install.json`, `build.json`, `css-parse.json`, the workspace, and aggregate `results.json`. Agent trials additionally retain the exact `prompt.txt`, `schema.json`, `agent.json` command result and, after successful inference, `candidate.json`. Each command records arguments, actual exit, timeout flag, duration, stdout and stderr. Timed-out command process groups are terminated.

Existing personal Codex skills, instructions and MCP configuration are inherited in both conditions. This is **not clean-room isolation**; the current local inventory found no global `tailwind-css` skill and an empty global Codex `AGENTS.md`, but unrelated personal/system skills still exist. Recheck that inventory before a measured run. The pilot's default order is without-skill then with-skill, not randomized.

A successful build plus CSS evidence does not establish full browser, interaction or accessibility correctness. The positive controls and proposal-validation logic have been exercised; the real successful agent-completion path remains unverified until authentication is restored. Do not publish efficacy, runtime support, installation counts, or community traction based on the control results.

Raw scratch logs are local, may contain account-environment details, and can be pruned after inactivity. Review, redact and deliberately archive evidence before any publication; no publication is performed by these commands.
