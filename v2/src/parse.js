import { SPACE } from "./const.js";
/** current index */
export let idx;
/** current string */
export let cur;
/**
 * operator/token lookup table
 * lookup[0] is id parser to let configs redefine it
 */
export const lookup = [];
/** no handling tagged literals since easily done on user side with cache, if needed */
export function parse(s) {
    idx = 0;
    cur = s;
    const s1 = expr();
    if (cur[idx])
        err();
    return s1 || '';
}
parse.id = id;
/** display error */
export function err(msg = 'Bad syntax') {
    const lines = cur.slice(0, idx).split('\n');
    const last = lines.pop();
    const before = cur.slice(idx - 108, idx).split('\n').pop();
    const after = cur.slice(idx, idx + 108).split('\n').shift();
    throw EvalError(`${msg} at ${lines.length}:${last.length} \`${idx >= 108 ? '…' : ''}${before}┃${after}\``, 'font-weight: bold');
}
/** advance until condition meets */
export function next(is, from = idx) {
    let l;
    while ((l = is(cur.charCodeAt(idx))))
        idx = (idx + +l);
    return cur.slice(from, idx);
}
/** advance n characters */
export function skip() {
    return cur[idx++];
}
/** a + b - c */
export function expr(prec = 0, end) {
    let cc;
    let token = undefined;
    let newNode = undefined;
    // chunk/token parser - parse a sequence of tokens/operators into an expression tree
    while (true) {
        // Skip whitespace and get the next character code
        cc = space();
        // If we've reached the end of the string (cc is 0 or NaN), stop parsing
        if (!cc)
            break;
        // Try to parse the next node using one of two strategies:
        // Strategy 1: Look up an operator handler for the current character
        // Call the operator handler with the current token and precedence
        // FIXME: extra work is happening here, when lookup bails out due to lower precedence -
        // it makes extra `space` call for parent exprs on the same character to check precedence again
        newNode = lookup[cc]?.(token, prec);
        // Strategy 2: If no operator handler matched (returned null/undefined),
        // and we don't have a token yet, parse a literal/identifier
        // Token sequences are forbidden: `a b`, `a "b"`, `1.32 a`
        if (!token)
            newNode ??= next(parse.id);
        // If we couldn't parse anything, exit the loop
        if (!newNode)
            break;
        // Update our accumulated token with the newly parsed node
        token = newNode;
    }
    // check end character
    if (end) {
        if (cc == end) {
            idx++;
        }
        else {
            err();
        }
    }
    return token;
}
/** skip space chars, return first non-space character */
export function space(cc) {
    while ((cc = cur.charCodeAt(idx)) <= SPACE)
        idx++;
    return cc;
}
/** parse identifier (configurable) */
export function id(c) {
    return ((c >= 48 && c <= 57) || // 0..9
        (c >= 65 && c <= 90) || // A...Z
        (c >= 97 && c <= 122) || // a...z
        c == 36 || c == 95 || // $, _,
        (c >= 192 && c != 215 && c != 247) // any non-ASCII
    );
}
/** create operator checker/mapper (see examples) */
export function token(op, prec = SPACE, map, c = op.charCodeAt(0), l = op.length, prev = lookup[c], word = op.toUpperCase() !== op // make sure word boundary comes after word operator
) {
    return lookup[c] = function (a, curPrec, curOp, from = idx) {
        // check if operator matches
        const opMatches = curOp ? op == curOp : ((l < 2 || cur.substr(idx, l) == op) && (curOp = op));
        if (!opMatches) {
            return prev?.(a, curPrec, curOp);
        }
        // matches precedence AFTER operator matched
        if (curPrec >= prec) {
            return prev?.(a, curPrec, curOp);
        }
        // finished word, not part of bigger word
        if (word && parse.id(cur.charCodeAt((idx + l)))) {
            return prev?.(a, curPrec, curOp);
        }
        // apply operator
        idx = (idx + l);
        const result = map(a);
        if (result) {
            return result;
        }
        // rollback and throw if operator didn't detect usage pattern: (a;^b) etc
        idx = from;
        if (!prev)
            err();
        return prev?.(a, curPrec, curOp);
    };
}
/** right assoc is indicated by negative precedence (meaning go from right to left) */
export function binary(op, prec, right = false) {
    return token(op, prec, (a) => {
        if (!a)
            return;
        let b = expr((prec - (right ? .5 : 0)));
        if (!b)
            return;
        return [op, a, b];
    });
}
/** post indicates postfix rather than prefix operator */
export function unary(op, prec, post) {
    return token(op, prec, (a) => {
        if (post) {
            if (!a)
                return;
            return [op, a];
        }
        else {
            if (a)
                return;
            let b = expr((prec - .5));
            if (!b)
                return;
            return [op, b];
        }
    });
}
/** FIXME: skips means ,,, ;;; are allowed */
export function nary(op, prec, _skips) {
    return token(op, prec, (a) => {
        let b = expr(prec);
        // if beginning of sequence - init node
        if (a?.[0] !== op) {
            a = [op, a || null];
        }
        // comments can return same-token expr
        if (b?.[0] === op) {
            a.push(...b.slice(1));
        }
        else {
            a.push(b || null);
        }
        return a;
    });
}
/**
 * register (a), [b], {c} etc groups
 * FIXME: add "Unclosed paren" error
 */
export function group(op, prec) {
    return token(op[0], prec, (a) => {
        if (a)
            return;
        return [op, expr(0, op.charCodeAt(1))];
    });
}
/**
 * register a(b), a[b], a<b> etc,
 * NOTE: we make sure `null` indicates placeholder
 */
export function access(op, prec) {
    return token(op[0], prec, (a) => {
        if (!a)
            return;
        return [op, a, expr(0, op.charCodeAt(1)) || null];
    });
}
export default parse;
