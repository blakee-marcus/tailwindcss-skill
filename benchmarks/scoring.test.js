// benchmarks/scoring.test.js
// Self-tests: prove each check passes valid fixtures and fails targeted mutations.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const BENCHMARKS_DIR = resolve(ROOT, 'benchmarks')
const FIXTURES_DIR = resolve(BENCHMARKS_DIR, 'fixtures')
const TMP_DIR = resolve(BENCHMARKS_DIR, '.test-tmp')

const results = []
let passed = 0
let failed = 0

const test = (name, fn) => {
  try {
    fn()
    results.push({ name, passed: true })
    passed++
    console.log(`✓ ${name}`)
  } catch (err) {
    results.push({ name, passed: false, error: err.message })
    failed++
    console.log(`✗ ${name}: ${err.message}`)
  }
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed')
}

const mkdirp = (p) => {
  if (!existsSync(p)) mkdirSync(p, { recursive: true })
}

const writeFile = (p, content) => {
  const dir = resolve(p, '..')
  mkdirp(dir)
  writeFileSync(p, content)
}

const copyFixture = (id) => {
  const src = join(FIXTURES_DIR, id)
  const dest = join(TMP_DIR, id)
  if (existsSync(dest)) rmSync(dest, { recursive: true })
  mkdirp(dest)
  const cpRecursive = (s, d) => {
    mkdirp(d)
    for (const entry of readdirSync(s, { withFileTypes: true })) {
      const srcPath = join(s, entry.name)
      const destPath = join(d, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue
        cpRecursive(srcPath, destPath)
      } else {
        writeFileSync(destPath, readFileSync(srcPath))
      }
    }
  }
  cpRecursive(src, dest)
  return dest
}

// Inline the scoring functions to test them directly
const hasV3Config = (dir) => {
  const configFiles = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts']
  for (const f of configFiles) {
    const fp = join(dir, f)
    if (existsSync(fp)) {
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
        if (/className=\{`[^`]*\$\{[^}]+\}[^`]*`\}/.test(c)) return true
        if (/className=\s*`[^`]*\$\{[^}]+\}[^`]*`/.test(c)) return true
      }
    }
    return false
  }
  return walk(dir)
}

const checkPackage = (dir, expected) => {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  return !!allDeps[expected]
}

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

// --- Tests ---

test('01-v4-dark-mode: no_v3_config passes on unmodified fixture', () => {
  const dir = copyFixture('01-v4-dark-mode')
  assert(!hasV3Config(dir), 'should not detect v3 config in unmodified v4 fixture')
})

test('01-v4-dark-mode: no_v3_config fails when tailwind.config.js is added', () => {
  const dir = copyFixture('01-v4-dark-mode')
  writeFile(join(dir, 'tailwind.config.js'), 'export default { content: ["./src/**/*"] }\n')
  assert(hasV3Config(dir), 'should detect v3 config when tailwind.config.js added')
})

test('01-v4-dark-mode: no_v3_config fails when @tailwind directives added', () => {
  const dir = copyFixture('01-v4-dark-mode')
  writeFile(join(dir, 'src', 'index.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n')
  assert(hasV3Config(dir), 'should detect @tailwind directives')
})

test('01-v4-dark-mode: no_v3_config passes when @config loads a JS config file', () => {
  const dir = copyFixture('01-v4-dark-mode')
  writeFile(join(dir, 'tailwind.config.js'), 'export default {}\n')
  writeFile(join(dir, 'src', 'index.css'), '@config "./tailwind.config.js";\n@import "tailwindcss";\n')
  assert(!hasV3Config(dir), 'should not flag config loaded via @config')
})

test('02-dynamic-classes: has_dynamic_classes passes on unmodified fixture', () => {
  const dir = copyFixture('02-dynamic-classes')
  assert(hasDynamicClasses(dir), 'should detect dynamic classes in unmodified fixture')
})

test('02-dynamic-classes: no_dynamic_classes fails when static classes replace dynamic', () => {
  const dir = copyFixture('02-dynamic-classes')
  writeFile(join(dir, 'src', 'App.jsx'), `
export default function App() {
  const variants = {
    blue: "bg-blue-600 text-white",
    red: "bg-red-500 text-white",
  };
  return <div className={variants["blue"]}>Test</div>;
}
`)
  assert(!hasDynamicClasses(dir), 'should not detect dynamic classes after rewrite')
})

test('03-preserve-vite-integration: correct_v4_package detects @tailwindcss/vite', () => {
  const dir = copyFixture('03-preserve-vite-integration')
  assert(checkPackage(dir, '@tailwindcss/vite'), 'should find @tailwindcss/vite')
})

test('03-preserve-vite-integration: correct_v4_package fails when package is wrong', () => {
  const dir = copyFixture('03-preserve-vite-integration')
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  delete pkg.devDependencies['@tailwindcss/vite']
  pkg.devDependencies['tailwindcss'] = '^4.0.0'
  writeFile(join(dir, 'package.json'), JSON.stringify(pkg, null, 2))
  assert(!checkPackage(dir, '@tailwindcss/vite'), 'should not find @tailwindcss/vite after removal')
})

test('04-v4-postcss: correct_v4_package detects @tailwindcss/postcss', () => {
  const dir = copyFixture('04-v4-postcss')
  assert(checkPackage(dir, '@tailwindcss/postcss'), 'should find @tailwindcss/postcss')
})

test('05-source-detection: source_detected passes when @source present', () => {
  const dir = copyFixture('05-source-detection')
  writeFile(join(dir, 'src', 'index.css'), '@import "tailwindcss";\n@source "../other/*.html";\n')
  assert(checkSource(dir), 'should detect @source directive')
})

test('05-source-detection: source_detected fails when @source missing', () => {
  const dir = copyFixture('05-source-detection')
  writeFile(join(dir, 'src', 'index.css'), '@import "tailwindcss";\n')
  assert(!checkSource(dir), 'should not detect @source when absent')
})

// Cleanup
if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true })

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
