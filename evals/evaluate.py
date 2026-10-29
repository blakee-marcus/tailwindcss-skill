"""Local Tailwind evaluation. Default invocation only describes unmeasured cases."""
import argparse
import hashlib
import json
import os
import re
import shutil
import signal
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES = [
    {"id": "01-v4-dark-mode", "classes": ["dark:bg-gray-900", "dark:text-white"],
     "preserved_classes": ["min-h-screen", "text-3xl"], "pipeline": "vite4", "dark": True,
     "prompt": "Add class-based dark mode: the page background should use dark:bg-gray-900 and its heading dark:text-white when a parent has class dark. Preserve light styles and the build integration."},
    {"id": "02-dynamic-classes", "classes": ["bg-blue-600", "bg-red-600", "bg-green-600"],
     "preserved_classes": ["p-8", "text-2xl"], "pipeline": "vite4",
     "prompt": "Fix the three colored spans: replace dynamic bg-${color}-600 construction with complete static Tailwind classes for blue, red and green. Preserve all three labels, layout, and the existing build integration."},
    {"id": "03-preserve-vite-integration", "classes": ["bg-blue-500"],
     "preserved_classes": ["min-h-screen", "text-3xl"], "pipeline": "vite4",
     "prompt": "Add bg-blue-500 to the outer container without replacing the existing Vite/Tailwind integration or changing its build command. Preserve the heading and layout."},
    {"id": "04-v4-postcss", "classes": ["bg-green-500"],
     "preserved_classes": ["min-h-screen", "text-3xl"], "pipeline": "postcss4",
     "prompt": "Repair the Tailwind v4 PostCSS plugin configuration and add bg-green-500 to the page container. Keep the PostCSS build command and existing dependencies; do not replace this pipeline with Vite or Tailwind CLI."},
    {"id": "05-source-detection", "classes": ["text-emerald-600"],
     "preserved_classes": ["min-h-screen", "text-3xl"], "pipeline": "vite4",
     "prompt": "The imported vendor/Panel.jsx heading uses text-emerald-600 but its style is missing. Repair Tailwind source registration. Do not copy the utility into app source, safelist the token, or edit the vendor component. Preserve the existing Vite integration."},
    {"id": "06-v3-stable", "classes": ["bg-blue-500"],
     "preserved_classes": ["min-h-screen", "text-3xl"], "pipeline": "vite3",
     "prompt": "Add bg-blue-500 to the outer container of this working Tailwind v3 project. It must stay on v3 with its existing config, directives, dependencies, and PostCSS integration. Preserve the heading and layout."},
]


def apply_proposal(workspace, proposal, allowed):
    """Validate the complete patch before modifying any file; never follow symlinks."""
    if not isinstance(proposal, dict) or set(proposal) != {"files"}:
        raise ValueError("Expected a files object")
    files = proposal["files"]
    if not isinstance(files, list) or len(files) > 8:
        raise ValueError("Expected at most eight file replacements")
    validated = []
    seen = set()
    for entry in files:
        if not isinstance(entry, dict) or set(entry) != {"path", "content"}:
            raise ValueError("Expected path and content only")
        name, content = entry["path"], entry["content"]
        if not isinstance(name, str) or name not in allowed or name in seen:
            raise ValueError("Unknown or duplicate candidate path")
        path = workspace / name
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(workspace.resolve()):
            raise ValueError("Candidate must be an existing, regular workspace file")
        if not isinstance(content, str) or len(content.encode()) > 65536:
            raise ValueError("Candidate content must be at most 64 KiB")
        seen.add(name)
        validated.append((path, content))
    for path, content in validated:
        path.write_text(content)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def snapshot(directory):
    excluded = {"node_modules", "dist", ".agents", ".claude", "__pycache__"}
    return {str(p.relative_to(directory)): digest(p.read_bytes())
            for p in sorted(directory.rglob("*"))
            if p.is_file() and not excluded.intersection(p.relative_to(directory).parts)}


def run_command(args, cwd, log, timeout=90, stdin=None):
    """No shell or pipelines: retain the actual command exit; terminate its process group."""
    started = time.monotonic()
    try:
        child = subprocess.Popen(args, cwd=cwd, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, text=True, start_new_session=True)
    except OSError as error:
        result = {"command": args, "exit": None, "timed_out": False, "stdout": "", "stderr": str(error)}
    else:
        timed_out = False
        try:
            out, err = child.communicate(stdin, timeout=timeout)
        except subprocess.TimeoutExpired:
            timed_out = True
            try:
                os.killpg(child.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                out, err = child.communicate(timeout=3)
            except subprocess.TimeoutExpired:
                os.killpg(child.pid, signal.SIGKILL)
                out, err = child.communicate()
        result = {"command": args, "exit": child.returncode, "timed_out": timed_out,
                  "stdout": out, "stderr": err}
    result["seconds"] = round(time.monotonic() - started, 3)
    log.parent.mkdir(parents=True, exist_ok=True)
    log.write_text(json.dumps(result, indent=2) + "\n")
    return result


def allowed_files(case):
    number = case["id"][:2]
    return {"01": {"src/App.jsx", "src/index.css"}, "02": {"src/App.jsx", "src/index.css"},
            "03": {"src/App.jsx"}, "04": {"postcss.config.js", "index.html", "src/index.css"},
            "05": {"src/index.css"}, "06": {"src/App.jsx"}}[number]


def prepare(case, destination, with_skill=False):
    source = ROOT / "benchmarks/fixtures" / case["id"]
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns("node_modules", "dist", "__pycache__"))
    before = snapshot(destination)
    if with_skill:
        skill = destination / ".agents/skills/tailwind-css"
        skill.mkdir(parents=True)
        shutil.copy2(ROOT / "SKILL.md", skill / "SKILL.md")
        shutil.copytree(ROOT / "references", skill / "references")
    return before


def preserves_color_labels(app):
    """Accept color names in JS string arrays/maps or directly rendered JSX text."""
    return all(bool(re.search(r"(?<![\w-])(?:['\"]" + color + r"['\"]|>\s*" + color + r"\s*<)", app))
               for color in ("blue", "red", "green"))


def score(case, workspace, before, evidence):
    # Every evaluation rebuilds in a fresh workspace; stale artifacts never count.
    build = run_command(["npm", "run", "build"], workspace, evidence / "build.json")
    artifacts = {str(p.relative_to(workspace)): digest(p.read_bytes())
                 for p in sorted((workspace / "dist").rglob("*.css"))}
    css = "\n".join((workspace / name).read_text() for name in artifacts)
    parsed = run_command(["node", str(ROOT / "evals/css-evidence.mjs")], ROOT,
                         evidence / "css-parse.json", stdin=css)
    rules = json.loads(parsed["stdout"]) if parsed["exit"] == 0 else []
    after = snapshot(workspace)
    editable = allowed_files(case)
    checks = {"build": build["exit"] == 0 and not build["timed_out"],
              "css_parsed": parsed["exit"] == 0,
              "architecture_preserved": all(after.get(p) == h for p, h in before.items() if p not in editable)
                  and set(after) == set(before)}
    for utility in case["classes"] + case["preserved_classes"]:
        prop = "background-color" if utility.startswith(("bg-", "dark:bg-")) else "color" if utility in case["classes"] else None
        matches = [r for r in rules if utility in r["classes"] and r["declarations"]
                   and (prop is None or any(d["property"] == prop for d in r["declarations"]))]
        if case.get("dark") and utility in case["classes"]:
            matches = [r for r in matches if r["class_dark"] and not r["media_dark"]]
        checks["css:" + utility] = bool(matches)
    number = case["id"][:2]
    if number == "02":
        app = (workspace / "src/App.jsx").read_text()
        checks["no_dynamic_bg_construction"] = not re.search(r"bg-\$\{", app)
        checks["three_colors_preserved"] = preserves_color_labels(app)
    if number == "05":
        entry = (workspace / "src/index.css").read_text()
        checks["vendor_registered_without_safelist"] = bool(re.search(r"@source\s+['\"][^'\"]*vendor", entry)) and "text-emerald-600" not in entry
    if number == "06":
        pkg = json.loads((workspace / "package.json").read_text())
        checks["v3_preserved"] = pkg["devDependencies"].get("tailwindcss") == "3.4.17" and "@tailwind base" in (workspace / "src/index.css").read_text()
    return {"status": "passed" if all(checks.values()) else "failed", "passed": all(checks.values()),
            "checks": checks, "build_exit": build["exit"], "artifacts": artifacts,
            "css_parser_exit": parsed["exit"]}


def controls(cases, output):
    gold = json.loads((ROOT / "evals/gold.json").read_text())
    results = []
    for case in cases:
        for condition in ("negative-control", "manual-gold"):
            evidence = output / case["id"] / condition
            workspace = evidence / "workspace"
            before = prepare(case, workspace)
            meta = {"fixture": case["id"], "condition": condition,
                    "fixture_hash": digest(json.dumps(before, sort_keys=True).encode()),
                    "prompt_hash": digest(case["prompt"].encode()), "workspace": str(workspace)}
            install = run_command(["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"], workspace,
                                  evidence / "install.json")
            if install["exit"] != 0 or install["timed_out"]:
                outcome = {"status": "infrastructure_error", "passed": None, "install_exit": install["exit"]}
            else:
                if condition == "manual-gold":
                    apply_proposal(workspace, gold[case["id"]], allowed_files(case))
                outcome = score(case, workspace, before, evidence)
            results.append({**meta, **outcome})
            print(case["id"], condition, outcome["status"], flush=True)
    validated = sum(any(r["fixture"] == c["id"] and r["condition"] == "manual-gold" and r["passed"] is True for r in results)
                    and any(r["fixture"] == c["id"] and r["condition"] == "negative-control" and r["passed"] is False for r in results) for c in cases)
    return {"mode": "controls", "completed_agent_pairs": 0, "validated_control_pairs": validated,
            "requested_cases": len(cases), "runs": results}


def completed_pairs(runs):
    grouped = {}
    for row in runs:
        if row.get("agent_completed"):
            grouped.setdefault(row["fixture"], set()).add(row["condition"])
    return sum({"without-skill", "with-skill"}.issubset(conditions) for conditions in grouped.values())


def agent_trials(cases, output, model, timeout):
    """Native project skill delivery; read/propose only, then independently build the candidate."""
    import tomllib
    config = Path.home() / ".codex/config.toml"
    settings = tomllib.loads(config.read_text()) if config.exists() else {}
    configured_model = model or settings.get("model")
    runtime = run_command(["codex", "--version"], ROOT, output / "runtime-version.json")
    payload = {"SKILL.md": digest((ROOT / "SKILL.md").read_bytes()),
               **{str(p.relative_to(ROOT)): digest(p.read_bytes()) for p in sorted((ROOT / "references").rglob("*")) if p.is_file()}}
    skill_hash = digest(json.dumps(payload, sort_keys=True).encode())
    results = []
    fatal = None
    for case in cases:
        allowed = allowed_files(case)
        prompt = (case["prompt"] + "\n\nRead the current project. If .agents/skills/tailwind-css/SKILL.md exists, read and follow that local skill and its references; otherwise solve normally. Do not install skills, inspect credentials, access external services, change configuration outside this workspace, or modify files. Return only JSON with a files array of complete replacement file contents; the evaluator will apply and build it. Do not run a dev server. Allowed replacement paths: " + ", ".join(sorted(allowed)))
        for condition in ("without-skill", "with-skill"):
            meta = {"fixture": case["id"], "condition": condition, "agent_completed": False,
                    "passed": None, "prompt_hash": digest(prompt.encode()),
                    "model_configured": configured_model, "model_actual": None,
                    "skill_hash": skill_hash if condition == "with-skill" else None}
            if fatal:
                results.append({**meta, "status": "not_attempted", "reason": fatal})
                continue
            evidence = output / case["id"] / condition
            workspace = evidence / "workspace"
            before = prepare(case, workspace, with_skill=condition == "with-skill")
            meta.update({"fixture_hash": digest(json.dumps(before, sort_keys=True).encode()),
                         "workspace": str(workspace)})
            (evidence / "prompt.txt").write_text(prompt)
            schema = {"type": "object", "properties": {"files": {"type": "array", "items": {
                "type": "object", "properties": {"path": {"type": "string", "enum": sorted(allowed)},
                    "content": {"type": "string"}}, "required": ["path", "content"], "additionalProperties": False}}},
                "required": ["files"], "additionalProperties": False}
            schema_path = evidence / "schema.json"
            schema_path.write_text(json.dumps(schema))
            install = run_command(["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"],
                                  workspace, evidence / "install.json")
            if install["exit"] != 0 or install["timed_out"]:
                results.append({**meta, "status": "infrastructure_error", "install_exit": install["exit"]})
                continue
            candidate = evidence / "candidate.json"
            command = ["codex", "exec", "--skip-git-repo-check", "--ephemeral", "--json", "-C", str(workspace),
                       "--output-schema", str(schema_path), "-o", str(candidate)]
            if model:
                command += ["--model", model]
            command.append("-")
            agent = run_command(command, workspace, evidence / "agent.json", timeout=timeout, stdin=prompt)
            meta["agent_exit"] = agent["exit"]
            if agent["exit"] != 0 or agent["timed_out"]:
                text = agent["stdout"] + agent["stderr"]
                auth_error = bool(re.search(r"401|unauthorized|invalid_refresh_token|access token.*refresh", text, re.I))
                reason = "Codex authentication failed; sign-in is required" if auth_error else "Agent exited unsuccessfully or timed out; see agent.json"
                results.append({**meta, "status": "blocked" if auth_error else "agent_error", "reason": reason})
                if auth_error:
                    fatal = reason
                print(case["id"], condition, "blocked" if auth_error else "agent_error", flush=True)
                continue
            meta["agent_completed"] = True
            try:
                apply_proposal(workspace, json.loads(candidate.read_text()), allowed)
            except (ValueError, OSError) as error:
                results.append({**meta, "passed": False, "status": "invalid_candidate", "reason": str(error)})
            else:
                results.append({**meta, **score(case, workspace, before, evidence)})
            print(case["id"], condition, results[-1]["status"], flush=True)
    return {"mode": "agents", "runtime": "codex", "runtime_version": runtime["stdout"].strip(),
            "model_configured": configured_model, "model_actual": None,
            "completed_agent_pairs": completed_pairs(results), "requested_cases": len(cases),
            "skill_manifest": payload, "runs": results,
            "limitations": ["Existing user Codex configuration, personal skills and MCP catalog are inherited identically; not clean-room isolation.",
                            "Skill is delivered as a native project directory. Successful skill loading/use must be confirmed from command traces before attributing an outcome.",
                            "Read-only proposal task with independently applied file replacements, not an unrestricted autonomous editing task.",
                            "Build/CSS/preservation checks do not establish full browser accessibility or interactive correctness.",
                            "One trial per condition is a pilot, not statistical evidence of improvement."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--plan", action="store_true")
    mode.add_argument("--controls", action="store_true")
    mode.add_argument("--agents", choices=["codex"])
    parser.add_argument("--model", help="Optional invocation-only model override; otherwise inherit Codex config")
    parser.add_argument("--agent-timeout", type=int, default=180)
    parser.add_argument("--case", choices=[c["id"] for c in CASES])
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    cases = [c for c in CASES if args.case is None or c["id"] == args.case]
    if not 1 <= args.agent_timeout <= 600:
        parser.error("Agent timeout must be between 1 and 600 seconds")
    if not args.controls and not args.agents:
        print(json.dumps({"status": "unmeasured", "completed_agent_pairs": 0, "cases": cases}, indent=2))
        return 0
    scratch = Path(os.environ.get("HERMES_EVAL_SCRATCH", str(Path.home() / ".hermes/cache/scratch")))
    scratch.mkdir(parents=True, exist_ok=True)
    output = args.output or Path(tempfile.mkdtemp(prefix="tailwind-eval-", dir=scratch))
    output = output.resolve()
    if output.is_relative_to(ROOT) or (output.exists() and any(output.iterdir())):
        parser.error("Output must be a new or empty directory outside the source repository")
    output.mkdir(parents=True, exist_ok=True)
    report = controls(cases, output) if args.controls else agent_trials(cases, output, args.model, args.agent_timeout)
    report.update({"timestamp": datetime.now(timezone.utc).isoformat(), "output": str(output),
                   "node": subprocess.check_output(["node", "--version"], text=True).strip(),
                   "npm": subprocess.check_output(["npm", "--version"], text=True).strip()})
    (output / "results.json").write_text(json.dumps(report, indent=2) + "\n")
    print("Evidence:", output)
    if args.controls:
        return 0 if report["validated_control_pairs"] == len(cases) else 1
    if report["completed_agent_pairs"] != len(cases):
        return 2
    return 0 if all(r["passed"] for r in report["runs"]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
