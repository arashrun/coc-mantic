
import Parser from 'tree-sitter'
import {log} from 'console'
import cpp from 'tree-sitter-cpp'
import { readFile } from 'fs'




const parser = new Parser()
parser.setLanguage(cpp)



readFile('/home/itc/code/Test/ToolButton/camera/Test.h','utf-8', (err, data)=>{
	if(err) {
		log(err)
		return
	}
	const tree = parser.parse(data)
	const node = tree.rootNode.descendantForPosition({row: 7, column: 9});
	log(node.type, node.text, node.grammarType, node.walk().currentFieldName, node.parent.type)
});

