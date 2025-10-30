export type index = number & { __brand: 'index' }
export type char = number & { __brand: 'char' }
export type charCode = number & { __brand: 'charCode' }
export type precedence = number & { __brand: 'precedence' }


declare global {
    interface String {
        charCodeAt(index: index): charCode
    }
}