export type index = number & { __brand: 'index' }
export type char = string & { __brand: 'char' }
export type charCode = number & { __brand: 'charCode' }
export type precedence = number & { __brand: 'precedence' }
export type token = string & { __brand: 'token' } | knownToken & {__brand?: 'token'}

type knownToken = justinToken | featureToken

type justinToken = 'in' | '===' | '!==' | '??' | '??=' | '||=' | '&&=' | '>>>' | '>>>=' | 'undefined' | 'NaN' | 'null'

type featureToken = '?' | '...' | '>>' | '<<' | '>>=' | '<<=' | '**' | '?.' | '{}' | ':' | '*' | '/' | '%' | '*=' | '/=' | '%=' | '!' | '||' | '&&' | '++' | '--' | '==' | '!=' | '>' | '<' | '>=' | '<=' | ',' | ';' | '/*' | '//' | '()' | 'true' | 'false' | '~' | '|' | '&' | '^' | '=' | '[]' | '=>' | '+' | '-' | '+=' | '-=' | '.' 

declare global {
    interface String {
        charCodeAt(index: index): charCode
    }
}

export type Node = UnaryNode | BinaryNode | NaryNode | GroupNode | AccessNode | LiteralNode | VariableNode
export type UnaryNode = [token, Node]
export type BinaryNode = [token, Node, Node]
export type NaryNode = [token, (Node | null), ...(Node | null)[]]
export type GroupNode = [token, (Node | null)]
export type AccessNode = [token, Node, (Node | null)]
export type LiteralNode = [undefined, unknown]
export type VariableNode = token
export type PlaceholderNode = null


export type ArrayNode = Extract<Node, any[]>