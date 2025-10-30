import type { charCode, precedence } from "./types"

export const PERIOD = 46 as charCode
export const OPAREN = 40 as charCode
export const CPAREN = 41 as charCode
export const OBRACK = 91 as charCode
export const CBRACK = 93 as charCode
export const OBRACE = 123 as charCode
export const CBRACE = 125 as charCode
export const SPACE = 32 as charCode
export const COLON = 58 as charCode
export const DQUOTE = 34 as charCode
export const QUOTE = 39 as charCode
export const _0 = 48 as charCode
export const _9 = 57 as charCode
export const _E = 69 as charCode
export const _e = 101 as charCode
export const BSLASH = 92 as charCode
export const SLASH = 47 as charCode
export const STAR = 42 as charCode

// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence
// we mult by 10 to leave space for extensions

export const PREC_STATEMENT = 5 as precedence
export const PREC_SEQ = 10 as precedence
export const PREC_ASSIGN = 20 as precedence
export const PREC_LOR = 30 as precedence
export const PREC_LAND = 40 as precedence
export const PREC_OR = 50 as precedence
export const PREC_XOR = 60 as precedence
export const PREC_AND = 70 as precedence
export const PREC_EQ = 80 as precedence
export const PREC_COMP = 90 as precedence
export const PREC_SHIFT = 100 as precedence
export const PREC_ADD = 110 as precedence
export const PREC_MULT = 120 as precedence
export const PREC_EXP = 130 as precedence
export const PREC_PREFIX = 140 as precedence
export const PREC_POSTFIX = 150 as precedence
export const PREC_ACCESS = 170 as precedence
export const PREC_GROUP = 180 as precedence
export const PREC_TOKEN = 200 as precedence