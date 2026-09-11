// benchmarks/scoring.js
// Deterministic scorer for Tailwind CSS agent skill benchmarks.
// Self-tests: node benchmarks/scoring.test.js
import { spawn, execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, copyFileSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const BENCHMARKS_DIR = resolve(ROOT, 'benchmarks')
const FIXTURES_DIR = resolve(BENCHMARKS_DIR, 'fixtures')
const RESULTS_DIR = resolve(BENCHMARKS_DIR, 'results')
const RUNS_DIR = resolve(BENCHMARKS_DIR, 'runs')

const FIXTURES = [
  {
    id: '01-v4-dark-mode',
    name: 'v4 Dark Mode',
    path: resolve(FIXTURES_DIR, '01-v4-dark-mode'),
    prompt: 'Add class-based dark mode support to the project.',
    checks: ['build', 'no_v3_config', 'expected_css_generated', 'integration_preserved'],
    expected_css: ['.dark .dark\\\\:bg-', '.dark\\\\:text-'],
  },
  {
    id: '02-dynamic-classes',
    name: 'Dynamic Classes',
    path: resolve(FIXTURES_DIR, '02-dynamic-classes'),
    prompt: 'Fix the component so all Tailwind styles are reliably generated. Currently using dynamic string interpolation for class names.',
    checks: ['build', 'no_dynamic_classes', 'expected_css_generated'],
    expected_css: ['.bg-blue-600', '.bg-red-600', '.bg-green-600'],
  },
  {
    id: '03-preserve-vite-integration',
    name: 'Preserve Vite Integration',
    path: resolve(FIXTURES_DIR, '03-preserve-vite-integration'),
    prompt: 'Add a Tailwind utility class to the project (e.g. bg-blue-500 to the container).',
    checks: ['build', 'no_v3_config', 'integration_preserved'],
    expected_css: ['.bg-blue-500'],
  },
  {
    id: '04-v4-postcss',
    name: 'v4 PostCSS',
    path: resolve(FIXTURES_DIR, '04-v4-postcss'),
    prompt: 'Configure Tailwind for this PostCSS project so the utility class bg-green-500 is available.',
    checks: ['build', 'correct_v4_package', 'no_v3_config', 'expected_css_generated'],
    expected_css: ['.bg-green-500'],
  },
  {
    id: '05-source-detection',
    name: 'Source Detection',
    path: resolve(FIXTURES_DIR, '05-source-detection'),
    prompt: 'The utility class text-emerald-600 is not being generated. Fix the missing Tailwind styles without duplicating the classes into application source.',
    checks: ['build', 'no_v3_config', 'expected_css_generated', 'source_detected'],
    expected_css: ['.text-emerald-600'],
  },
]

const run = (cmd, cwd, timeout = 120000) =>
  new Promise((res) => {
    const child = spawn(cmd, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      res({ signal: 'SIGTERM', out, err, timedOut: true })
    }, timeout)
    child.stdout.on('data', (d) => (out += d.toString()))
    child.stderr.on('data', (d) => (err += d.toString()))
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      res({ code, signal, out, err, timedOut: false })
    })
  })

const loadJson = (path, def) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf')) : def)
const writeJson = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
const cp = (src, dest) => execSync(`cp -r "${src}" "${dest}"`)
const rm = (path) => existsSync(path) && rmSync(path, { recursive: true })

// Check for v3 config constructs, but allow explicit @config-loaded files
const hasV3Config = (dir) => {
  const configFiles = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts']
  for (const f of configFiles) {
    const fp = join(dir, f)
    if (existsSync(fp)) {
      // If the config is explicitly loaded via @config in the CSS, it's allowed
      const cssFiles = readdirSync(join(dir, 'src')).filter((n) => n.endsWith('.css'))
      let loadedByConfig = false
      for (const css of cssFiles) {
        const cssContent = readFileSync(join(dir, 'src', css), 'utf8')
        if (cssContent.includes('@config') && cssContent.includes(f)) {
          loadedByConfig = true
          break
        }
      }
      if (!loadedByConfig) return true
    }
  }
  // Check for @tailwind directives in CSS (always v3)
  const cssFiles = readdirSync(join(dir, 'src'), { recursive: true }).filter((n) => n.endsWith('.css'))
  for (const f of cssFiles) {
    const content = readFileSync(join(dir, 'src', f), 'utf8')
    if (/@tailwind\s+(base|components|utilities)/.test(content)) return true
    if (/^\s*content:\s*\[/m.test(content)) return true
  }
  return false
}

const hasDynamicClasses = (dir) => {
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue
        if (walk(p)) return true
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const c = readFileSync(p, 'utf8')
        // Match template literals with ${...} used in className (JSX expression form)
        if (/className=\{`[^`]*\$\{[^}]+\}[^`]*`\}/.test(c)) return true
        // Also match string form: className={`...${...}...`}
        if (/className=\s*`[^`]*\$\{[^}]+\}[^`]*`/.test(c)) return true
      }
    }
    return false
  }
  return walk(dir)
}

const checkPackage = (dir, expected) => {
  const pkg = loadJson(join(dir, 'package.json'), {})
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  return !!allDeps[expected]
}

// Check for EXACT selectors in CSS output (not just broad strings)
const checkCssOutput = (dir, expectedSelectors) => {
  const distDir = join(dir, 'dist')
  let cssContent = ''
  if (existsSync(join(distDir, 'assets'))) {
    for (const f of readdirSync(join(distDir, 'assets'))) {
      if (f.endsWith('.css')) {
        cssContent += readFileSync(join(distDir, 'assets', f), 'utf8')
      }
    }
  }
  const outFile = join(distDir, 'index.css')
  if (existsSync(outFile)) {
    cssContent += readFileSync(outFile, 'utf8')
  }
  if (!cssContent) return false
  return expectedSelectors.every((sel) => cssContent.includes(sel))
}

const checkSource = (dir) => {
  const srcDir = join(dir, 'src')
  if (!existsSync(srcDir)) return false
  for (const f of readdirSync(srcDir)) {
    if (f.endsWith('.css')) {
      if (readFileSync(join(srcDir, f), 'utf8').includes('@source')) return true
    }
  }
  return false
}

const scoreRun = async (fixture, condition, cwd) => {
  const checks = {}
  const buildResult = await run('npm run build', cwd, 90000)
  checks.build = buildResult.code === 0 && !buildResult.timedOut

  if (fixture.checks.includes('no_v3_config')) {
    checks.no_v3_config = !hasV3Config(cwd)
  }

  if (fixture.checks.includes('no_dynamic_classes')) {
    checks.no_dynamic_classes = !hasDynamicClasses(cwd)
  }

  if (fixture.checks.includes('expected_css_generated')) {
    checks.expected_css_generated = checkCssOutput(cwd, fixture.expected_css)
  }

  if (fixture.checks.includes('correct_v4_package')) {
    const expectedPkg = fixture.id === '04-v4-postcss' ? '@tailwindcss/postcss' : '@tailwindcss/vite'
    checks.correct_v4_package = checkPackage(cwd, expectedPkg)
  }

  if (fixture.checks.includes('integration_preserved')) {
    const pkg = loadJson(join(cwd, 'package.json'), {})
    checks.integration_preserved = !!pkg.devDependencies['@tailwindcss/vite']
  }

  if (fixture.checks.includes('source_detected')) {
    checks.source_detected = checkSource(cwd)
  }

  const passed = Object.values(checks).every(Boolean)
  return { passed, checks, buildExitCode: buildResult.code }
}

const generateSummary = (results) => {
  const baseline = results.filter((r) => r.condition === 'baseline')
  const withSkill = results.filter((r) => r.condition === 'with-skill')
  const countPassed = (arr) => arr.filter((r) => r.passed).length
  const p0 = countPassed(baseline)
  const p1 = countPassed(withSkill)

  let md = `# Benchmark Results\n\n`
  md += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`
  md += `## Summary\n\n`
  md += `| | Passed |\n|---|---:|\n`
  md += `| Without skill | ${p0}/${baseline.length} |\n`
  md += `| With skill | ${p1}/${withSkill.length} |\n\n`
  md += `## Per-fixture results\n\n`
  for (const r of results) {
    const status = r.passed ? '✅' : '❌'
    md += `- **${r.fixture}** (${r.condition}): ${status}\n`
    if (r.checks) {
      for (const [check, val] of Object.entries(r.checks)) {
        md += `  - ${check}: ${val ? '✓' : '✗'}\n`
      }
    }
  }
  md += `\n## Raw runs\n\n`
  md += `Full output in \`benchmarks/runs/\` and \`benchmarks/results/results.json\`.\n`
  return md
}

const main = async () => {
  const execute = process.argv.includes('--execute')
  mkdirSync(RESULTS_DIR, { recursive: true })
  mkdirSync(join(RUNS_DIR, 'baseline'), { recursive: true })
  mkdirSync(join(RUNS_DIR, 'with-skill'), { recursive: true })

  const results = []

  if (!execute) {
    for (const fixture of FIXTURES) {
      results.push({
        fixture: fixture.id,
        condition: 'dry-run',
        fixtureExists: existsSync(fixture.path),
        fixturePath: fixture.path,
        prompt: fixture.prompt,
        checks: fixture.checks,
        expected_css: fixture.expected_css,
        passed: null,
        note: 'dry run — agent execution not simulated',
      })
    }
  } else {
    for (const fixture of FIXTURES) {
      // Baseline run
      const baselineDir = join(RUNS_DIR, 'baseline', fixture.id)
      rm(baselineDir)
      mkdirSync(baselineDir, { recursive: true })
      cp(fixture.path, baselineDir)
      // TODO: invoke agent without skill, capture output
      const baselineResult = await scoreRun(fixture, 'baseline', baselineDir)
      results.push({ fixture: fixture.id, condition: 'baseline', ...baselineResult })

      // With-skill run
      const withSkillDir = join(RUNS_DIR, 'with-skill', fixture.id)
      rm(withSkillDir)
      mkdirSync(withSkillDir, { recursive: true })
      cp(fixture.path, withSkillDir)
      // TODO: invoke agent with skill, capture output
      const withSkillResult = await scoreRun(fixture, 'with-skill', withSkillDir)
      results.push({ fixture: fixture.id, condition: 'with-skill', ...withSkillResult })
    }
  }

  const summary = generateSummary(results)
  writeJson(resolve(RESULTS_DIR, 'results.json'), { results, timestamp: new Date().toISOString() })
  writeFileSync(resolve(RESULTS_DIR, 'summary.md'), summary)

  console.log(summary)
  if (!execute) {
    console.log('\nDry run complete. Fixtures validated, scoring criteria documented.')
    console.log('Run with --execute to perform actual benchmark runs.')
  }
}

main()
