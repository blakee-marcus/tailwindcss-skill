// Parse generated CSS selectors, not comments or strings, as evidence.
import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

// A dark class in a negation, :has(), or sibling selector does not establish
// that the target utility applies underneath a .dark ancestor.
function positiveDarkAncestor(selector) {
  let found = false
  selector.walkClasses(cls => {
    if (cls.value !== 'dark') return
    for (let parent = cls.parent; parent; parent = parent.parent) {
      if (parent.type === 'pseudo' && /^(?::not|:has|:nth-|:host-context)/i.test(parent.value)) return
    }
    const siblings = cls.parent?.nodes ?? []
    const index = siblings.indexOf(cls)
    if (siblings.slice(index + 1).some(node =>
      node.type === 'combinator' && (node.value.trim() === '' || node.value.trim() === '>')
    )) found = true
  })
  return found
}

const root = postcss.parse(readFileSync(0, 'utf8'))
const rules = []
root.walkRules(rule => {
  const ancestors = []
  const media = []
  for (let node = rule; node && node !== root; node = node.parent) {
    if (node.type === 'rule') ancestors.unshift(node)
    else if (node.type === 'atrule' && node.name === 'media') media.push(node.params)
  }

  // Do not borrow a utility class or dark scope from an unrelated comma branch.
  let branches = [{ classes: [], class_dark: false }]
  for (const ancestor of ancestors) {
    const alternatives = selectorParser().astSync(ancestor.selector).nodes.map(selector => {
      const classes = []
      selector.walkClasses(cls => classes.push(cls.value))
      return { classes, class_dark: positiveDarkAncestor(selector) }
    })
    branches = branches.flatMap(prior => alternatives.map(next => ({
      classes: [...prior.classes, ...next.classes],
      class_dark: prior.class_dark || next.class_dark,
    })))
  }

  const declarations = rule.nodes.filter(node => node.type === 'decl')
    .map(node => ({ property: node.prop, value: node.value }))
  for (const branch of branches) {
    rules.push({
      selector: rule.selector,
      classes: [...new Set(branch.classes)],
      declarations,
      class_dark: branch.class_dark,
      media_dark: media.some(value => value.includes('prefers-color-scheme')),
    })
  }
})
console.log(JSON.stringify(rules))
