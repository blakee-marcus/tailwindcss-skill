# Skill-File Editing Hazards

Traps that have burned real ingestion passes on this skill. Encode both into every future edit.

## 1. `skill_manage` `patch` can silently corrupt content

When `skill_manage` `patch` receives a large multi-line `new_string`, it has written the text with literal backslash-n escape sequences instead of real newlines. The file collapses into one garbled line and the tool still reports "Patched successfully."

Discipline:
- After any `skill_manage` `patch`, re-read the file (via `skill_view`) and confirm real line breaks exist — not a single line packed with `\n` tokens.
- For full-file rewrites prefer `skill_manage` `write_file` or terminal Python over `patch`.
- If a file shows one line packed with backslash-n escape tokens, it is corrupted. Restore it (`git checkout` where tracked) and redo the edit by a different method.
- Fast corruption check: `python3 -c "import sys; print('CORRUPT' if '\\n' in open(sys.argv[1]).read() else 'clean', sys.argv[1])" <file>`  (note: that single-quoted shell form will not catch it; use the Python check below instead).

```python
with open(path) as f:
    if '\\n' in f.read():  # literal backslash + n, not a real newline
        print("CORRUPT:", path)
```

## 2. Live skill and git repo are separate trees

Skill tooling edits the deployed copy under `.agents/skills/<name>/`. The git repo root is the parent directory and frequently tracks a *different* copy; `.agents/` is usually untracked there. Edits applied to one tree do not automatically appear in the other.

Discipline:
- After editing, reconcile the git-tracked copy with the deployed copy so they match (confirm which is authoritative first).
- Run `git status --short` and confirm only intended files are modified.
- Never let `.agents/`, `.claude/`, or `skills-lock.json` enter a commit.
- Commit ingestion as one source-ingestion change, then freeze ingestion until a real failure demands more breadth.
