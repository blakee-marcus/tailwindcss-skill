// Parse real CSS selectors; comments and string literals are not evidence.
import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const root = postcss.parse(readFileSync(0, 'utf8'))
const rules = []
root.walkRules(rule => {
  const classes = []
  const media = []
  for (let node = rule; node && node !== root; node = node.parent) {
    if (node.type === 'rule') {
      selectorParser(selectors => selectors.walkClasses(c => classes.push(c.value)))
        .processSync(node.selector)
    } else if (node.type === 'atrule' && node.name === 'media') {
      media.push(node.params)
    }
  }
  rules.push({
    selector: rule.selector,
    classes: [...new Set(classes)],
    declarations: rule.nodes.filter(n => n.type === 'decl').map(n => ({ property: n.prop, value: n.value })),
    class_dark: classes.includes('dark'),
    media_dark: media.some(value => value.includes('prefers-color-scheme')),
  })
})
console.log(JSON.stringify(rules))
