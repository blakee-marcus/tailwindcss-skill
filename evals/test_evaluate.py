"""Behavioral tests for the evaluator, not copies of its implementation."""
import importlib.util
import os
import tempfile
import sys
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
RUNNER = ROOT / "evals/evaluate.py"
SCRATCH = Path(os.environ.get("HERMES_EVAL_SCRATCH", str(Path.home() / ".hermes/cache/scratch")))
SCRATCH.mkdir(parents=True, exist_ok=True)


class PlanTests(unittest.TestCase):
    def test_plan_lists_six_cases_without_claiming_measured_results(self):
        result = subprocess.run(["python3", str(RUNNER), "--plan"], cwd=ROOT,
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        plan = json.loads(result.stdout)
        self.assertEqual(len(plan["cases"]), 6)
        self.assertEqual(plan["status"], "unmeasured")
        self.assertEqual(plan["completed_agent_pairs"], 0)


class CssEvidenceTests(unittest.TestCase):
    def parse(self, css):
        result = subprocess.run(["node", str(ROOT / "evals/css-evidence.mjs")],
                                input=css, capture_output=True, text=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_comments_and_attribute_values_are_not_utility_selectors(self):
        rules = self.parse('/* .bg-blue-500{} */ .x[data-note=".bg-blue-500"] { content: ".bg-blue-500" }')
        self.assertEqual(rules[0]["classes"], ["x"])

    def test_nested_class_dark_scope_is_distinguished_from_media_dark(self):
        rules = self.parse('.dark\\:bg-gray-900 { &:where(.dark,.dark *) { background-color: black } } @media(prefers-color-scheme:dark){.dark\\:text-white{color:white}}')
        actual = [r for r in rules if r["declarations"]]
        self.assertTrue(actual[0]["class_dark"])
        self.assertFalse(actual[1]["class_dark"])
        self.assertTrue(actual[1]["media_dark"])


class ProposalTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("evaluate", RUNNER)
        assert spec is not None and spec.loader is not None
        self.evaluator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.evaluator)
        apply = getattr(self.evaluator, "apply_proposal", None)
        self.assertTrue(callable(apply), "Missing validated proposal application")
        assert callable(apply)
        self.apply = apply
        self.temp = tempfile.TemporaryDirectory(dir=SCRATCH)
        self.addCleanup(self.temp.cleanup)
        self.workspace = Path(self.temp.name)
        (self.workspace / "App.jsx").write_text("original")

    def test_invalid_later_path_cannot_cause_partial_writes(self):
        proposal = {"files": [{"path": "App.jsx", "content": "changed"},
                              {"path": "../escape", "content": "bad"}]}
        with self.assertRaises(ValueError):
            self.apply(self.workspace, proposal, {"App.jsx"})
        self.assertEqual((self.workspace / "App.jsx").read_text(), "original")

    def test_symlink_targets_are_rejected(self):
        (self.workspace / "link.jsx").symlink_to(self.workspace / "App.jsx")
        with self.assertRaises(ValueError):
            self.apply(self.workspace, {"files": [{"path": "link.jsx", "content": "bad"}]}, {"link.jsx"})

    def test_valid_candidate_replaces_only_allowed_existing_file(self):
        self.apply(self.workspace, {"files": [{"path": "App.jsx", "content": "changed"}]}, {"App.jsx"})
        self.assertEqual((self.workspace / "App.jsx").read_text(), "changed")


class ControlIntegrationTests(unittest.TestCase):
    def test_one_case_builds_and_checks_real_generated_css(self):
        with tempfile.TemporaryDirectory(dir=SCRATCH) as temp:
            output = Path(temp) / "run"
            result = subprocess.run(["python3", str(RUNNER), "--controls", "--case",
                                     "03-preserve-vite-integration", "--output", str(output)],
                                    cwd=ROOT, capture_output=True, text=True, timeout=120)
            self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
            report = json.loads((output / "results.json").read_text())
            self.assertEqual(report["mode"], "controls")
            self.assertEqual(report["completed_agent_pairs"], 0)
            self.assertEqual([r["passed"] for r in report["runs"]], [False, True])
            self.assertTrue(all(r["build_exit"] == 0 for r in report["runs"]))
            self.assertTrue(all(r["artifacts"] for r in report["runs"]))
            self.assertEqual(report["runs"][0]["fixture_hash"], report["runs"][1]["fixture_hash"])


class AgentAccountingTests(unittest.TestCase):
    def test_blocked_and_incomplete_runs_are_not_completed_comparisons(self):
        spec = importlib.util.spec_from_file_location("evaluate", RUNNER)
        assert spec is not None and spec.loader is not None
        evaluator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(evaluator)
        count = getattr(evaluator, "completed_pairs", None)
        self.assertTrue(callable(count), "Missing honest pair accounting")
        assert callable(count)
        self.assertEqual(count([
            {"fixture": "a", "condition": "without-skill", "agent_completed": True},
            {"fixture": "a", "condition": "with-skill", "agent_completed": False},
        ]), 0)
        self.assertEqual(count([
            {"fixture": "a", "condition": "without-skill", "agent_completed": True},
            {"fixture": "a", "condition": "with-skill", "agent_completed": True},
        ]), 1)

    def test_agent_cli_exposes_explicit_model_timeout_and_scope_options(self):
        result = subprocess.run(["python3", str(RUNNER), "--help"], capture_output=True, text=True)
        for option in ["--agents", "--model", "--agent-timeout"]:
            self.assertIn(option, result.stdout)


class ProcessEvidenceTests(unittest.TestCase):
    def test_real_failure_exit_and_timeout_are_preserved(self):
        spec = importlib.util.spec_from_file_location("evaluate", RUNNER)
        assert spec is not None and spec.loader is not None
        evaluator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(evaluator)
        with tempfile.TemporaryDirectory(dir=SCRATCH) as temp:
            log = Path(temp) / "command.json"
            failed = evaluator.run_command([sys.executable, "-c", "raise SystemExit(7)"], ROOT, log)
            self.assertEqual(failed["exit"], 7)
            self.assertFalse(failed["timed_out"])
            timed = evaluator.run_command([sys.executable, "-c", "import time; time.sleep(10)"], ROOT, log, timeout=0.1)
            self.assertTrue(timed["timed_out"])
            self.assertNotEqual(timed["exit"], 0)
            self.assertEqual(json.loads(log.read_text())["timed_out"], True)


if __name__ == "__main__":
    unittest.main()
