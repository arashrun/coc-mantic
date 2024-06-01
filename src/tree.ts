import Parser, {Point} from 'tree-sitter'
import language from 'tree-sitter-cpp'
import { log } from 'console'

const parser = new Parser()
parser.setLanguage(language)

export interface nodeInfo {
    isFunction: boolean
    functionName: string
	funcStartPos?: Point
    className: string
}

export function getNodeInfo(sourceCode: string, row: number, colum: number) {
    const tree = parser.parse(sourceCode)
    let info: nodeInfo = {
        isFunction: false,
        functionName: '',
        className: '',
    }
    let curNode = tree.rootNode.descendantForPosition({
        row: row,
        column: colum,
    })
	// className
    let classNode = curNode.closest('class_specifier')
    if (classNode) {
        if (
            row > classNode.startPosition.row &&
            row < classNode.endPosition.row
        ) {
			info.className = classNode.firstNamedChild?.text ?? ''
        }
    }
	// isFunction, functionName
    let parentType = curNode.parent?.type
    if (parentType == 'function_declarator') {
        info.isFunction = true
        info.functionName = curNode.text
		info.funcStartPos = curNode.startPosition
    }
    return info
}
