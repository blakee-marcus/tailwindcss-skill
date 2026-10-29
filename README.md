<div align="center">
  <p>
    <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="64" height="64" alt="Tailwind CSS mark" />
  </p>

  <h1>Tailwind CSS Agent Skill</h1>

  <p><strong>Version-aware Tailwind CSS for coding agents.</strong></p>
  <p>Inspect the project. Preserve the integration. Verify the CSS.</p>

  <p>
    <a href="https://skills.sh/blakee-marcus/tailwindcss-skill"><img src="https://img.shields.io/badge/Install-skills.sh-0F172A?style=flat-square" alt="Install with skills.sh" /></a>
    <img src="https://img.shields.io/badge/Tailwind-v3_%2B_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v3 and v4" />
    <a href="https://github.com/blakee-marcus/tailwindcss-skill/actions/workflows/benchmark-validation.yml"><img src="https://github.com/blakee-marcus/tailwindcss-skill/actions/workflows/benchmark-validation.yml/badge.svg" alt="Benchmark validation CI" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/blakee-marcus/tailwindcss-skill?style=flat-square" alt="MIT license" /></a>
  </p>

  <p>
    <a href="#quick-start">Quick start</a> ·
    <a href="#why-this-skill">Why this skill</a> ·
    <a href="#how-it-works">Workflow</a> ·
    <a href="#compatibility">Compatibility</a> ·
    <a href="#evaluation--evidence">Evidence</a>
  </p>
</div>

---

Coding agents can mix Tailwind v3 and v4 conventions, replace a working build integration, or generate dynamic classes that never appear in the output CSS. **This skill tells the agent to check the installed version before editing and verify the generated CSS afterward.** It also protects working v3 projects from unrequested upgrades.

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>01 · Version-aware</h3>
      Detect v3 or v4 and use the configuration model that actually applies to the project.
    </td>
    <td width="33%" valign="top">
      <h3>02 · Architecture-safe</h3>
      Keep the existing Vite, PostCSS, CLI, or framework-native integration unless a change is necessary.
    </td>
    <td width="33%" valign="top">
      <h3>03 · CSS-verified</h3>
      Build the project, then check that the expected utility or variant exists in emitted CSS.
    </td>
  </tr>
</table>

## Quick start

Install with the [skills.sh installer](https://skills.sh/blakee-marcus/tailwindcss-skill):

```bash
npx skills add blakee-marcus/tailwindcss-skill
```

Then open a Tailwind project in a compatible coding agent and ask:

> Add class-based dark mode to this project. Check the installed Tailwind version first, preserve the existing build integration, and verify the generated CSS.

The installer uses Node/npm. The skill itself is Markdown; agents need access to the project and a way to run its package manager and build. **You do not need the benchmark dependencies to use the skill.** Invocation varies by agent; no universal slash command is assumed.

<details>
<summary><strong>Manual installation and Claude Code plugin loading</strong></summary>

Clone into a new destination; don't overwrite an existing skill installation.

```bash
# Hermes Agent
git clone https://github.com/blakee-marcus/tailwindcss-skill.git \
  ~/.hermes/skills/software-development/tailwind-css

# Claude Code — personal
git clone https://github.com/blakee-marcus/tailwindcss-skill.git \
  ~/.claude/skills/tailwind-css

# Claude Code — project
git clone https://github.com/blakee-marcus/tailwindcss-skill.git \
  .claude/skills/tailwind-css

# Claude Code — plugin, from a local checkout
claude --plugin-dir /path/to/tailwindcss-skill
```

Keep `SKILL.md` and `references/` together. Manual skill directories use `tailwind-css` to match the name in `SKILL.md`; avoid duplicate installations with that name.

</details>

## Why this skill

### A familiar failure: v3 advice in a v4 project

Imagine a Vite app already running Tailwind v4. The request is _“Add class-based dark mode.”_

<table>
  <thead>
    <tr>
      <th align="left" width="50%">Stale v3-style approach</th>
      <th align="left" width="50%">v4-compatible approach</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">
        <code>tailwind.config.js</code>
        <pre><code>export default {
  darkMode: 'class',
  content: ['./src/**/*.{jsx,js}'],
}</code></pre>
        A JS config file isn't loaded automatically in v4; these v3 configuration options are not the way to enable class-based dark mode.
      </td>
      <td valign="top">
        <code>src/index.css</code>
        <pre><code>@import "tailwindcss";

@custom-variant dark (&amp;:where(.dark, .dark \*));</code></pre>
Preserve the existing Vite integration, use <code>dark:</code> classes, and toggle <code>.dark</code> on an ancestor.
</td>
</tr>

  </tbody>
</table>

<sub>Illustrative example, not a recorded with-skill / without-skill model comparison. JavaScript configs can be loaded explicitly using <code>@config</code>; that doesn't make v3-only options valid in v4.</sub>

### Failure modes it guards against

| Problem                          | Agent guidance                                                                                      |
| :------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Wrong-version configuration**  | Inspect the installed Tailwind version first; never migrate a working v3 project without a request. |
| **Broken integrations**          | Preserve `@tailwindcss/vite`, `@tailwindcss/postcss`, and established build commands.               |
| **Missing dynamic utilities**    | Replace `bg-${color}-600` interpolation with complete, statically discoverable class strings.       |
| **Unnecessary one-off values**   | Prefer existing theme tokens such as `--color-brand` over new arbitrary values.                     |
| **False-positive build success** | Check the generated CSS for the intended utility and variant—not just exit code `0`.                |

## How it works

The skill defines a five-stage workflow, not a new build system or a Tailwind plugin.

| Stage              | Agent responsibility                                                                              | Expected result                              |
| :----------------- | :------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| **01 · Detect**    | Inspect the installed version, package manager, config, CSS entrypoints, and build scripts.       | No version or pipeline guessing.             |
| **02 · Classify**  | Identify v3 vs v4, Vite/PostCSS/CLI integration, and the task type.                               | A version-appropriate approach.              |
| **03 · Implement** | Make the smallest change that meets the request.                                                  | Existing architecture is preserved.          |
| **04 · Protect**   | Reject incompatible directives, unrequested migrations, and dynamically constructed class tokens. | No known version-mixing regressions.         |
| **05 · Verify**    | Run the project build and inspect the generated CSS; run relevant tests.                          | Evidence that the requested CSS was emitted. |

<details>
<summary><strong>More example requests</strong></summary>

> These `bg-${color}-600` classes aren't showing up. Fix the component without changing its labels or layout.

> Add a blue background to this Tailwind v3 app. Keep the existing v3 configuration and PostCSS setup.

> This vendor component uses `text-emerald-600`, but no styles are generated. Fix source detection without copying the utility into app code.

> Review this Tailwind PR for version mismatches and missing generated styles. Preserve the project's build integration.

</details>

## Coverage

| Area                | Included guidance                                                                               |
| :------------------ | :---------------------------------------------------------------------------------------------- |
| **Setup**           | Vite, PostCSS, CLI, and existing framework-native build pipelines.                              |
| **Styles**          | Utilities, theme tokens, colors, dark mode, responsive design, container queries, and variants. |
| **Class discovery** | Static class tokens, `@source`, safelisting, and missing styles in vendor code.                 |
| **Migration**       | v3 → v4, the upgrade tool, Preflight, and browser compatibility.                                |
| **Debugging**       | Missing utilities, broken builds, configuration mismatches, and generated-CSS inspection.       |

## Compatibility

The skill uses the [Agent Skills format](https://agentskills.io/specification). A documented installation path does **not** mean that agent behavior has been verified.

| Runtime                                             | Installation                                             | Evidence to date                                                     |
| :-------------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------- |
| **Hermes Agent**                                    | Manual skill directory                                   | Local installation/discovery exercised; no effectiveness comparison. |
| **Claude Code**                                     | skills.sh, manual directory, or included plugin manifest | Behavioral validation not completed.                                 |
| **Codex**                                           | skills.sh                                                | Evaluation runner exists; behavioral comparison not completed.       |
| **Cursor, Windsurf, Copilot, Gemini CLI, OpenCode** | skills.sh                                                | Behavioral validation not completed.                                 |

<details>
<summary><strong>Integration and platform notes</strong></summary>

The skill covers Tailwind CSS v3 and v4, but it follows the installed project version rather than upgrading by default. Its operational instructions are agent-neutral and use the host agent's shell or terminal tool. Framework- or runtime-specific behavior should be validated on a real project before being listed as verified here.

</details>

## Evaluation & evidence

**The benchmark harness is validated; skill effectiveness is not yet measured.** Its six locked fixtures cover dark mode, dynamic classes, Vite preservation, PostCSS repair, source registration, and keeping v3 stable.

<table>
  <tr>
    <td align="center" width="33%"><strong>6 / 6</strong><br/><sub>Control pairs validated</sub></td>
    <td align="center" width="33%"><strong>10 / 10</strong><br/><sub>Tests in the recorded evaluator run</sub></td>
    <td align="center" width="33%"><strong>0 / 6</strong><br/><sub>Agent comparison pairs completed</sub></td>
  </tr>
</table>

These are the **recorded results**, not live metrics. The negative/manual-gold controls validate the evaluator and real CSS builds. They **do not** demonstrate an uplift from installing the skill. An attempted Codex run ended at authentication, so the paired model comparison remains unmeasured. [Read the full results](benchmarks/results/summary.md) and [methodology](evals/README.md).

To reproduce the credential-free evaluator checks (Python 3.11+ and Node/npm):

```bash
npm ci --ignore-scripts
npm test
npm run benchmark:controls
```

[GitHub Actions](.github/workflows/benchmark-validation.yml) runs unit tests and fixture controls. Authenticated model trials are a separate opt-in process; CI success must not be presented as agent-performance proof.

## Project map

| Path                                                   | What you'll find                                             |
| :----------------------------------------------------- | :----------------------------------------------------------- |
| [`SKILL.md`](SKILL.md)                                 | Agent-facing workflow and operational guardrails.            |
| [`references/`](references/)                           | Topic-specific Tailwind guidance.                            |
| [`references/docs-index.md`](references/docs-index.md) | Official source links and reference ownership.               |
| [`evals/`](evals/README.md)                            | Evaluator, acceptance checks, and reproduction instructions. |
| [`benchmarks/`](benchmarks/README.md)                  | Test fixtures and qualified evidence.                        |

Guidance is progressively grounded in the [official Tailwind CSS documentation](https://tailwindcss.com/docs), not presented as a complete mirror. The installed package version and project configuration remain the starting point. **This is an independent community skill, not an official Tailwind CSS project.**

<details>
<summary><strong>Contributing to the skill</strong></summary>

1. Check the [source index](references/docs-index.md) before adding a reference or rule.
2. Put operational rules in `SKILL.md`; add deep technical detail to its owning file in `references/` rather than duplicating it.
3. Link the exact official documentation that supports each change; distinguish evidence from assumptions.
4. Run the relevant evaluator checks when changing fixtures, scoring, or behavior.
5. Never mark an agent runtime or effectiveness claim verified without execution evidence.

Issues and focused PRs are welcome: [open an issue](https://github.com/blakee-marcus/tailwindcss-skill/issues) · [view pull requests](https://github.com/blakee-marcus/tailwindcss-skill/pulls).

</details>

---

<div align="center">
  <p>Built for <a href="https://agentskills.io/specification">Agent Skills</a> · Grounded in <a href="https://tailwindcss.com/docs">Tailwind documentation</a> · <a href="LICENSE">MIT licensed</a></p>
  <sub>Tailwind CSS is a trademark of its respective owner. This independent skill is not affiliated with Tailwind Labs.</sub>
</div>
