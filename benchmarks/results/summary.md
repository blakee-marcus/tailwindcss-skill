# Tailwind evaluation results

Control run recorded UTC: `2026-10-29T00:46:37.704044+00:00`. These are local evaluator-validation results, not measured agent comparisons.

## Proven state

- **6/6 fixture control pairs validated** using real locked installs, real builds and parsed generated CSS.
- **10/10 evaluator tests passed**, including a real-build integration test, comment/string rejection, dark-scope parsing, candidate-path validation, process failures/timeouts and pair accounting.
- **0/6 agent comparison pairs completed.** One real Codex invocation was attempted; it exited with an authentication failure. The remaining eleven condition runs were explicitly not attempted—not scored as failures.
- No evidence of skill uplift has been measured. Manual gold output is not a with-skill model result.

## Controls, not an agent leaderboard

| Case | Untouched negative control | Manually corrected positive control | Agent comparison |
|---|---|---|---|
| `01-v4-dark-mode` | Rejected (build exit 0) | Passed (build exit 0) | Unmeasured |
| `02-dynamic-classes` | Rejected (build exit 0) | Passed (build exit 0) | Unmeasured |
| `03-preserve-vite-integration` | Rejected (build exit 0) | Passed (build exit 0) | Unmeasured |
| `04-v4-postcss` | Rejected (build exit 1) | Passed (build exit 0) | Unmeasured |
| `05-source-detection` | Rejected (build exit 0) | Passed (build exit 0) | Unmeasured |
| `06-v3-stable` | Rejected (build exit 0) | Passed (build exit 0) | Unmeasured |

The original v3 project builds successfully before any task change. Its negative control fails only because the requested blue-background addition is absent. The broken v4 PostCSS fixture's original build failure is intentional; its manual correction builds with the original package versions and build command.

## Runtime blockers

- **Codex:** `codex-cli 0.136.0`; a saved ChatGPT login is present, but an actual `exec` request fails with HTTP 401 / invalid refresh token. Configured model: `gpt-5.5`; no responding model was established. The harness exits **2** for this incomplete comparison.
- **Claude Code:** `2.1.162 (Claude Code)`; `claude auth status` returned logged-in **false** and exit **1**. No Claude model task or skill behavior was validated. A Claude evaluation driver is not implemented.
- No authentication, sandbox, approval or global provider configuration was changed to bypass these failures.

After authorized reauthentication, rerun the bounded Codex pilot with `npm run benchmark:agents`. Do not mark runtime behavior verified merely because login status succeeds. The successful real-agent response path and skill use still require observation.

## Files and reproduction

- [Methodology and commands](../../evals/README.md).
- [Structured results](results.json): per-run checks, fixture/prompt hashes, artifact hashes, runtime status, limitations and evaluator hashes.
- [Retained evidence](evidence/): actual install/build/parser command results and generated CSS; the failed agent command, exact prompt and output schema are retained separately under `evidence/agents/`.
- Root `npm ci --ignore-scripts`, `npm test`, then `npm run benchmark:controls` reproduces evaluator validation. Python 3.11+, Node/npm required.

Environment for this control run: Node `v26.7.0`, npm `11.19.0`. Fixtures pin Tailwind v4 `4.3.3` or v3 `3.4.17`, with package locks. Scratch workspaces are deliberately outside the repository and absent from the CSS scan roots.

## Limits

One pair per case is only a pilot. Codex's existing personal/system skills and MCP catalog are inherited in both conditions; this is not clean-room isolation. Native project skill delivery has a hash but must not be confused with observed reading/use. Build/CSS checks are not full browser, interaction or accessibility validation. Existing README demo scenarios are illustrations, not measured baseline/treatment outcomes.

Publication copies normalize absolute local paths to `<REPO_ROOT>`, `<HOME>`, `<CONTROLS_RUN>` and `<AGENT_RUN>`. Transient request/thread identifiers and unrelated MCP diagnostics are redacted. Exit codes, timings, authentication-failure evidence, acceptance checks and generated-CSS bytes/hashes are preserved. No authentication or runtime configuration was repaired as part of this evaluation.
