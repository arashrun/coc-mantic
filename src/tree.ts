
import Parser from 'tree-sitter'
import language from 'tree-sitter-cpp'
import {log} from 'console'



export function getClassName(sourceCode: string, row: number, colum?: number)
{
	const parser = new Parser();
	parser.setLanguage(language);

	const tree = parser.parse(sourceCode);
	for(let i=0; i<tree.rootNode.namedChildCount; i++) {
		let node = tree.rootNode.namedChildren[i]
		if(node.type == 'class_specifier') {
			if(row > node.startIndex && row < node.endIndex) {
				// class name
				let classChildren = node.namedChildren
				classChildren.find((child, index)=>{
					if(child.type == 'type_identifier') {
						log(child.text)
						return child.text
					}
				})
			}
		}
	}
	return ''
}
