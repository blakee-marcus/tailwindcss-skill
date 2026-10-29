// Compatibility entry point. The evaluator now invokes real runtimes; no simulated results.
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).flatMap(arg => arg === '--execute' ? ['--agents', 'codex'] : [arg])
  const result = spawnSync('python3', [resolve(root, 'evals/evaluate.py'), ...args], { cwd: root, stdio: 'inherit' })
  if (result.error) console.error(result.error.message)
  process.exit(result.status ?? 1)
}
