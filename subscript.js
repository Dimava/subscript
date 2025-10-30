/**
 * Subscript dialect includes common operators / primitives for all languages
 */
import './v2/feature/number.js'
import './v2/feature/string.js'
import './v2/feature/call.js'
import './v2/feature/access.js'
import './v2/feature/group.js'
import './v2/feature/assign.js'
import './v2/feature/mult.js'
import './v2/feature/add.js'
import './v2/feature/increment.js'
import './v2/feature/bitwise.js'
import './v2/feature/logic.js'
import './v2/feature/compare.js'
import './v2/feature/shift.js'
import compile from './src/compile.js'
import parse from './src/parse.js'

export { parse, access, binary, unary, nary, group, token } from './src/parse.js'
export { compile, operator } from './src/compile.js'
export { stringify } from './src/stringify.js'

export default s => compile(parse(s))
