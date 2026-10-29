// Compatibility entry point: exercise the actual evaluator, not copied scorer functions.
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const result = spawnSync('python3', ['-m', 'unittest', 'discover', '-s', 'evals', '-v'], { cwd: root, stdio: 'inherit' })
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
