import { err } from "./parse.js"
import type { Node, token, VariableNode } from "./types.js"

type ctx = Record<string, any>
type OperatorFunction = (...args: any[]) => any;
type OperatorMap = {
  [key: token]: OperatorFunction;
};
// registered operators
export const operators: OperatorMap = {}

// build optimized evaluator for the tree
export function compile(node: Node) {
    if (!Array.isArray(node)) return id(node)
    if (!node[0]) return () => node[1]
    return operators[node[0]].call(...node)
}

// compile id getter
export function id(name: VariableNode) {
  return (ctx: ctx) => ctx?.[name]
}
compile.id = id

// register an operator
export function operator(op: token, fn: OperatorFunction): void {
  const prev = operators[op]
  operators[op] = (...args) => fn(...args) || prev?.(...args)
}

// takes node and returns evaluator depending on the case with passed params (container, path, ctx) =>
export function prop(a: Node, fn: Function, generic?: boolean) {
  // (((x))) => x
  if (a[0] === '()' && a.length == 2) return prop(a[1], fn, generic)
  // (_, name, ctx) => ctx[path]
  if (typeof a === 'string') return (ctx: ctx) => fn(ctx, a, ctx)
  // (container, path, ctx) => container(ctx)[path]
  if (a[0] === '.') {
    const obj = compile(a[1]), path = a[2]
    return (ctx: ctx) => fn(obj(ctx), path, ctx)
  }
  // (container, path, ctx) => container(ctx)[path(ctx)]
  if (a[0] === '[]' && a.length === 3) {
    const obj = compile(a[1]), path = compile(a[2])
    return (ctx: ctx) => fn(obj(ctx), path(ctx), ctx)
  }
  // (src, _, ctx) => src(ctx)
  if (generic) {
    const compiled = compile(a)
    return (ctx: ctx) => fn([compiled(ctx)], 0, ctx)
  }
  return () => err('Bad left value')
}

export default compile
