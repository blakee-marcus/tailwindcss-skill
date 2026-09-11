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

const collectCss = (dir) => {
  const distDir = join(dir, 'dist')
  let cssContent = ''
  if (existsSync(join(distDir, 'assets'))) {
    for (const f of readdirSync(join(distDir, 'assets'))) {
      if (f.endsWith('.css')) {
        cssContent += readFileSync(join(distDir, 'assets', f), 'utf8') + '\n'
      }
    }
  }
  const outFile = join(distDir, 'index.css')
  if (existsSync(outFile)) {
    cssContent += readFileSync(outFile, 'utf8')
  }
  return cssContent
}

const checkDarkVariant = (dir, expectedUtilities) => {
  const cssContent = collectCss(dir)
  if (!cssContent) return false

  // Must have the expected utilities (with escaped colons, e.g. .dark\:bg-gray-900)
  const hasUtilities = expectedUtilities.every((util) => {
    return cssContent.includes(util)
  })
  if (!hasUtilities) return false

  // Must have class-based dark variant: either :where(.dark, .dark *) or a .dark selector
  const hasDarkScope =
    cssContent.includes(':where(.dark, .dark *)') ||
    cssContent.includes('.dark ') ||
    cssContent.includes('.dark{') ||
    cssContent.includes('.dark\\:')

  const hasPrefersColorScheme = cssContent.includes('prefers-color-scheme')

  return hasDarkScope && !hasPrefersColorScheme
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

// --- Unit tests ---

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

test('01-v4-dark-mode: checkDarkVariant passes with :where(.dark) scope', () => {
  const dir = copyFixture('01-v4-dark-mode')
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'),
    '.dark\\:bg-gray-900 { &:where(.dark, .dark *) { background-color: rgb(17 24 39); } }\n' +
    '.dark\\:text-white { &:where(.dark, .dark *) { color: rgb(255 255 255); } }\n'
  )
  assert(checkDarkVariant(dir, ['.dark\\:bg-', '.dark\\:text-']), 'should detect dark variant via :where(.dark)')
})

test('01-v4-dark-mode: checkDarkVariant fails when prefers-color-scheme present', () => {
  const dir = copyFixture('01-v4-dark-mode')
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'),
    '@media (prefers-color-scheme: dark) { .dark\\:bg-gray-900 { background-color: rgb(17 24 39); } }\n'
  )
  assert(!checkDarkVariant(dir, ['.dark\\:bg-']), 'should fail when only prefers-color-scheme is used')
})

test('02-dynamic-classes: has_dynamic_classes passes on unmodified fixture', () => {
  const dir = copyFixture('02-dynamic-classes')
  assert(hasDynamicClasses(dir), 'should detect dynamic classes in unmodified fixture')
})

test('02-dynamic-classes: no_dynamic_classes PASSES when static classes replace dynamic', () => {
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
  assert(!hasDynamicClasses(dir), 'should not detect dynamic classes after static rewrite')
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

// --- Integration tests: known-good output produces overall pass ---

test('INTEGRATION: fixture 01 (dark mode) produces pass with valid dark-variant CSS', () => {
  const dir = copyFixture('01-v4-dark-mode')
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'),
    '.dark\\:bg-gray-900 { &:where(.dark, .dark *) { background-color: rgb(17 24 39); } }\n' +
    '.dark\\:text-white { &:where(.dark, .dark *) { color: rgb(255 255 255); } }\n'
  )
  // no_v3_config: true (no config file added)
  // expected_css_generated: true (dark variant + utilities present)
  // integration_preserved: true (@tailwindcss/vite in package.json)
  const noV3 = !hasV3Config(dir)
  const darkOk = checkDarkVariant(dir, ['.dark\\:bg-', '.dark\\:text-'])
  const pkgOk = checkPackage(dir, '@tailwindcss/vite')
  assert(noV3, 'no_v3_config should pass')
  assert(darkOk, 'expected_css_generated should pass')
  assert(pkgOk, 'integration_preserved should pass')
})

test('INTEGRATION: fixture 02 (dynamic classes) produces pass after static rewrite', () => {
  const dir = copyFixture('02-dynamic-classes')
  writeFile(join(dir, 'src', 'App.jsx'), `
export default function App() {
  const variants = {
    blue: "bg-blue-600 text-white",
    red: "bg-red-600 text-white",
    green: "bg-green-600 text-white",
  };
  return (
    <div>
      <span className={variants.blue}>blue</span>
      <span className={variants.red}>red</span>
      <span className={variants.green}>green</span>
    </div>
  );
}
`)
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'),
    '.bg-blue-600 { background-color: rgb(37 99 235); }\n' +
    '.bg-red-600 { background-color: rgb(220 38 38); }\n' +
    '.bg-green-600 { background-color: rgb(22 163 74); }\n'
  )
  const noDyn = !hasDynamicClasses(dir)
  const cssOk = collectCss(dir).includes('.bg-blue-600') &&
                collectCss(dir).includes('.bg-red-600') &&
                collectCss(dir).includes('.bg-green-600')
  assert(noDyn, 'no_dynamic_classes should pass')
  assert(cssOk, 'expected_css_generated should pass')
})

test('INTEGRATION: fixture 03 (preserve vite) produces pass when @tailwindcss/vite retained', () => {
  const dir = copyFixture('03-preserve-vite-integration')
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'), '.bg-blue-500 { background-color: rgb(59 130 246); }\n')
  const noV3 = !hasV3Config(dir)
  const pkgOk = checkPackage(dir, '@tailwindcss/vite')
  const cssOk = collectCss(dir).includes('.bg-blue-500')
  assert(noV3, 'no_v3_config should pass')
  assert(pkgOk, 'integration_preserved should pass')
  assert(cssOk, 'expected_css_generated should pass')
})

test('INTEGRATION: fixture 04 (v4 postcss) produces pass with @tailwindcss/postcss', () => {
  const dir = copyFixture('04-v4-postcss')
  mkdirp(join(dir, 'dist'))
  writeFile(join(dir, 'dist', 'index.css'), '.bg-green-500 { background-color: rgb(34 197 94); }\n')
  const noV3 = !hasV3Config(dir)
  const pkgOk = checkPackage(dir, '@tailwindcss/postcss')
  const cssOk = collectCss(dir).includes('.bg-green-500')
  assert(noV3, 'no_v3_config should pass')
  assert(pkgOk, 'correct_v4_package should pass')
  assert(cssOk, 'expected_css_generated should pass')
})

test('INTEGRATION: fixture 05 (source detection) produces pass with @source directive', () => {
  const dir = copyFixture('05-source-detection')
  writeFile(join(dir, 'src', 'index.css'), '@import "tailwindcss";\n@source "../lib/*.jsx";\n')
  mkdirp(join(dir, 'dist', 'assets'))
  writeFile(join(dir, 'dist', 'assets', 'index.css'), '.text-emerald-600 { color: rgb(5 150 105); }\n')
  const noV3 = !hasV3Config(dir)
  const cssOk = collectCss(dir).includes('.text-emerald-600')
  const srcOk = checkSource(dir)
  assert(noV3, 'no_v3_config should pass')
  assert(cssOk, 'expected_css_generated should pass')
  assert(srcOk, 'source_detected should pass')
})

// Cleanup
if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true })

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
