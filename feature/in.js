import { PREC_COMP } from '../src/const.js';
import { binary } from "../src/parse.js"
import { operator, compile } from "../src/compile.js"

binary('in', PREC_COMP)
operator('in', (a, b) => (a = compile(a), b = compile(b), ctx => a(ctx) in b(ctx)))

