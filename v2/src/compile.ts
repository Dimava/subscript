import { err } from "./parse.js"

// registered operators
export const operators = {}

// build optimized evaluator for the tree
export function compile(node) {
  return !Array.isArray(node) ? id(node) : !node[0] ? () => node[1] : operators[node[0]].call(...node)
}

// compile id getter
export function id(name) {
  return ctx => ctx?.[name]
}
compile.id = id

// register an operator
export function operator(op, fn) {
  const prev = operators[op]
  operators[op] = (...args) => fn(...args) || prev?.(...args)
}

// takes node and returns evaluator depending on the case with passed params (container, path, ctx) =>
export function prop(a, fn, generic) {
  // (((x))) => x
  if (a[0] === '()' && a.length == 2) return prop(a[1], fn, generic)
  // (_, name, ctx) => ctx[path]
  if (typeof a === 'string') return ctx => fn(ctx, a, ctx)
  // (container, path, ctx) => container(ctx)[path]
  if (a[0] === '.') {
    const obj = compile(a[1]), path = a[2]
    return ctx => fn(obj(ctx), path, ctx)
  }
  // (container, path, ctx) => container(ctx)[path(ctx)]
  if (a[0] === '[]' && a.length === 3) {
    const obj = compile(a[1]), path = compile(a[2])
    return ctx => fn(obj(ctx), path(ctx), ctx)
  }
  // (src, _, ctx) => src(ctx)
  if (generic) {
    const compiled = compile(a)
    return ctx => fn([compiled(ctx)], 0, ctx)
  }
  return () => err('Bad left value')
}

export default compile
