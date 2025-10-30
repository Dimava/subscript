export type index = number & { __brand: 'index' }
export type char = string & { __brand: 'char' }
export type charCode = number & { __brand: 'charCode' }
export type precedence = number & { __brand: 'precedence' }
export type token = string & { __brand: 'token' }


declare global {
    interface String {
        charCodeAt(index: index): charCode
    }
}

export type Node = UnaryNode | BinaryNode | NaryNode | GroupNode | AccessNode | LiteralNode | VariableNode | PlaceholderNode
export type UnaryNode = [token, Node]
export type BinaryNode = [token, Node, Node]
export type NaryNode = [token, Node, ...Node[]]
export type GroupNode = [token, Node]
export type AccessNode = [token, Node, Node]
export type LiteralNode = [undefined, token]
export type VariableNode = token
export type PlaceholderNode = null | undefined
