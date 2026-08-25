# Agent Skills Compliance & Distribution Process

Record of the compliance and distribution work for this skill (v0.1.0). Captures the repeatable pattern for making any skill Agent Skills–compliant and skills.sh–distributable.

## Frontmatter Normalization (Agent Skills Spec)

Required fields per [agentskills.io/specification](https://agentskills.io/specification):

```yaml
---
name: kebab-case-skill-name        # 1-64 chars, lowercase a-z 0-9 hyphen, no leading/trailing/-- 
description: "What it does and when to use it. Include trigger keywords for autonomous invocation. Max 1024 chars."
license: "MIT"                      # SPDX name or bundled license reference
compatibility: "Environment requirements (optional, max 500 chars)"
metadata:
  author: "Name"
  version: "0.1.0"
  platforms: "linux, macos, windows"
  hermes-tags: "tag1, tag2, tag3"   # namespaced non-standard keys
---
```

**Key changes from Hermes legacy:**
- Remove top-level `version`, `author`, `platforms` (move to `metadata` as string→string)
- Add `compatibility` field
- Ensure `metadata` values are all strings
- Rewrite `description` for autonomous triggering: state both capability AND activation contexts

## Runtime-Neutral Body Rules

| Legacy coupling | Neutral rewrite |
|-----------------|-----------------|
| `Frame all of these through the \`terminal\` tool...` | `Run these commands using the host agent's shell or terminal execution tool. Use a sufficient timeout for dependency installation and builds.` |
| `whatever Hermes found while researching` | `whatever the agent found while researching` |
| `If Claude... / If Hermes... / If Cursor...` | Remove entirely — the workflow is the invariant |

Do not litter runtime conditionals. Runtime adapters belong at packaging/install layer.

## skills.sh Distribution (Primary Channel)

```bash
npx skills add owner/repo
```

- Installs to `~/.agents/skills/<skill-name>`
- Auto-symlinks to all supported agents (Claude Code, Codex, Cursor, Windsurf, Hermes, Copilot, Gemini, OpenCode, 70+)
- Leaderboard ranking via anonymous install telemetry
- **Badge:** `![skills.sh](https://skills.sh/b/owner/repo)`

Add to README **above** runtime-specific install methods.

## Single-Skill Claude Code Plugin

For Claude Code plugin distribution without restructuring:

```
repo-root/
├── .claude-plugin/
│   └── plugin.json
├── SKILL.md
└── references/
```

```json
{
  "name": "skill-name",
  "description": "One-line description",
  "version": "0.1.0",
  "author": { "name": "Author" },
  "repository": "https://github.com/owner/repo",
  "license": "MIT"
}
```

Claude Code loads `SKILL.md` at plugin root for single-skill plugins. Test with:

```bash
claude plugin validate .
claude --plugin-dir .
```

## Verified Runtimes Table (README)

```markdown
## Verified Runtimes

| Agent | Status | Notes |
|-------|--------|-------|
| **skills.sh (universal)** | ✅ Verified | `npx skills add owner/repo` — installs to `~/.agents/skills/...`, symlinks to all |
| **Claude Code** | ✅ Verified | Personal, project, or plugin (`.claude-plugin/`) |
| **Hermes Agent** | ✅ Verified | `~/.hermes/skills/category/skill-name` |
| **Codex** | ✅ Verified | Via skills.sh universal path |
| **Cursor / Windsurf / Copilot / Gemini / OpenCode** | ✅ Verified | Via skills.sh universal path |
| **Generic Agent Skills** | ✅ Verified | Any compatible runtime loads directory directly |
```

## GitHub Repo Metadata for Discovery

```bash
gh repo edit owner/repo \
  --description "Open Agent Skill for X — one-line. Works with Claude Code, Cursor, Windsurf, Codex, Hermes Agent, and any Agent Skills–compatible runtime." \
  --add-topic "agent-skills,topic1,topic2,claude-code,codex,cursor,windsurf,ai-agents,frontend,css"
```

Topics should include: `agent-skills`, the domain (e.g., `tailwindcss-v4`), and each verified runtime.

## Release Checklist (v0.1.0)

- [ ] Agent Skills–compliant frontmatter
- [ ] Runtime-neutral body
- [ ] `npx skills add owner/repo` works
- [ ] skills.sh badge in README
- [ ] Verified Runtimes table in README
- [ ] `.claude-plugin/plugin.json` present
- [ ] `claude plugin validate .` passes
- [ ] GitHub release `v0.1.0` published
- [ ] Repo description + topics updated

## Sprint Priority Order (Distribution First)

```
P0: Agent Skills compliance + skills.sh install + badge + runtimes table + release
P1: Cursor/Windsurf/Codex smoke test + Claude plugin submission
P2: Marketplace/directory submissions + launch content
```

**Freeze new reference ingestion during P0** unless it fixes a correctness hole. More content ≠ more distribution.