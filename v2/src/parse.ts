import { SPACE } from "./const.js"
import type { index, charCode, precedence } from "./types.js"

/** current string, index and collected ids */
export let idx: index, cur: string, lookup = []

/** no handling tagged literals since easily done on user side with cache, if needed */
export function parse(s: string) {
  return (idx = 0 as index, cur = s, s = expr(), cur[idx] ? err() : s || '')
}

/** display error */
export function err(msg: string = 'Bad syntax',
  lines = cur.slice(0, idx).split('\n'),
  last = lines.pop()
): never {
  const before = cur.slice(idx - 108, idx).split('\n').pop()
  const after = cur.slice(idx, idx + 108).split('\n').shift()
  throw EvalError(`${msg} at ${lines.length}:${last.length} \`${idx >= 108 ? '…' : ''}${before}┃${after}\``, 'font-weight: bold')
}

/** advance until condition meets */
export function next(is: (c: charCode) => number, from: index = idx, l?: number) {
  while (l = is(cur.charCodeAt(idx))) idx += l as index
  return cur.slice(from, idx)
}

/** advance n characters */
export function skip(): string {
  return cur[idx++]
}

/** a + b - c */
export function expr(prec: precedence = 0 as precedence, end?: charCode) {
  let cc: charCode, token, newNode, fn

  // chunk/token parser
  while (
    (cc = space()) && // till not end
    // FIXME: extra work is happening here, when lookup bails out due to lower precedence -
    // it makes extra `space` call for parent exprs on the same character to check precedence again
    (newNode =
      ((fn = lookup[cc]) && fn(token, prec)) ?? // if operator with higher precedence isn't found
      (!token && next(parse.id)) // parse literal or quit. token seqs are forbidden: `a b`, `a "b"`, `1.32 a`
    )
  ) token = newNode;

  // check end character
  if (end) cc == end ? idx++ as index : err()

  return token
}

/** skip space chars, return first non-space character */
export function space(cc?: charCode): charCode {
  while ((cc = cur.charCodeAt(idx)) <= SPACE) idx++ as index;
  return cc
}

/** parse identifier (configurable) */
export const id = parse.id = function(c: charCode): boolean {
  return (
    (c >= 48 && c <= 57) || // 0..9
    (c >= 65 && c <= 90) || // A...Z
    (c >= 97 && c <= 122) || // a...z
    c == 36 || c == 95 || // $, _,
    (c >= 192 && c != 215 && c != 247) // any non-ASCII
  )
}

/**
 * operator/token lookup table
 * lookup[0] is id parser to let configs redefine it
 */


/** create operator checker/mapper (see examples) */
export function token(
  op: string,
  prec: precedence = SPACE as precedence,
  map: (a: any) => any,
  c: charCode = op.charCodeAt(0 as index),
  l: number = op.length,
  prev = lookup[c],
  word: boolean = op.toUpperCase() !== op // make sure word boundary comes after word operator
) {
  return lookup[c] = function(a: any, curPrec: precedence, curOp?: string, from: index = idx) {
    return (
      (curOp ?
        op == curOp :
        ((l < 2 || cur.substr(idx, l) == op) && (curOp = op)) // save matched op to avoid mismatches like `|` as part of `||`
      ) &&
      curPrec < prec && // matches precedence AFTER operator matched
      !(word && parse.id(cur.charCodeAt((idx + l) as index))) && // finished word, not part of bigger word
      (idx += l as index, map(a) || (idx = from, !prev && err())) // throw if operator didn't detect usage pattern: (a;^b) etc
    ) ||
    prev?.(a, curPrec, curOp)
  }
}

/** right assoc is indicated by negative precedence (meaning go from right to left) */
export function binary(op: string, prec: precedence, right: boolean = false) {
  return token(op, prec, function(a, b) {
    return a && (b = expr((prec - (right ? .5 : 0)) as precedence)) && [op, a, b]
  })
}

/** post indicates postfix rather than prefix operator */
export function unary(op: string, prec: precedence, post?: boolean) {
  return token(op, prec, function(a) {
    return post ? (a && [op, a]) : (!a && (a = expr((prec - .5) as precedence)) && [op, a])
  })
}

/** FIXME: skips means ,,, ;;; are allowed */
export function nary(op: string, prec: precedence, skips?: boolean) {
  token(op, prec,
    function(a, b) {
      return (
        b = expr(prec),
        (
          (a?.[0] !== op) && (a = [op, a || null]), // if beginning of sequence - init node
          b?.[0] === op ? a.push(...b.slice(1)) : a.push(b || null), // comments can return same-token expr
          a
        ))
    }
  )
}

/**
 * register (a), [b], {c} etc groups
 * FIXME: add "Unclosed paren" error
 */
export function group(op: string, prec: precedence) {
  return token(op[0], prec, function(a) {
    return (!a && [op, expr(0 as precedence, op.charCodeAt(1 as index))])
  })
}

/**
 * register a(b), a[b], a<b> etc,
 * NOTE: we make sure `null` indicates placeholder
 */
export function access(op: string, prec: precedence) {
  return token(op[0], prec, function(a) {
    return (a && [op, a, expr(0 as precedence, op.charCodeAt(1 as index)) || null])
  })
}


export default parse
