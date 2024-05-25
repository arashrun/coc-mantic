
import Parser from 'tree-sitter'
import language from 'tree-sitter-cpp'
import {log} from 'console'


const parser = new Parser();
parser.setLanguage(language);

export interface nodeInfo
{
	isFunction: boolean;
	functionName: string;
	className: string;
}

export function getNodeInfo(sourceCode: string, row: number, colum: number)
{

	const tree = parser.parse(sourceCode);
	let info:nodeInfo = {
		isFunction : false,
		functionName: '',
		className : ''
	}

	let classname = '';
	for(let i=0; i<tree.rootNode.namedChildCount; i++) {
		let node = tree.rootNode.namedChildren[i]
		if(node.type == 'class_specifier') {
			if(row > node.startPosition.row && row < node.endPosition.row) {
				// class name
				let classChildren = node.namedChildren
				classChildren.find((child, index)=>{
					if(child.type == 'type_identifier') {
						info.className = child.text;
						return child.text
					}
				})
			}
		}
	}

	let curNode = tree.rootNode.descendantForPosition({row: row, column: colum});
	let parentType = curNode.parent?.type
	if(parentType == 'function_declarator') {
		info.isFunction = true;
		info.functionName = curNode.text;
	}
	return info
}

