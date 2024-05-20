import * as coc from 'coc.nvim'
import { RequestType, type TextDocumentIdentifier, type TextDocumentPositionParams, Uri, window, workspace } from 'coc.nvim'
import { getClassName } from './tree';


namespace SwitchSourceHeaderRequest {
  export const type = new RequestType<TextDocumentIdentifier, string, void>('textDocument/switchSourceHeader');
}

export class CodeActionProvider implements coc.CodeActionProvider
{

	provideCodeActions(
		document: coc.LinesTextDocument,
	   	range: coc.Range,
	   	context: coc.CodeActionContext,
	   	token: coc.CancellationToken
	): coc.ProviderResult<(coc.CodeAction | coc.Command)[]> {

		const actions: coc.CodeAction[] = [
			this.addDefinition(document, range),

		]

		return actions;
	}

	private addDefinition(
		document: coc.LinesTextDocument,
		range: coc.Range
	): coc.CodeAction {

		const edit : coc.WorkspaceEdit = {
			changes: {
			}
		};

		const lineNumber = range.start.line + 1;
		const pos :coc.Position= {line:lineNumber, character: 0};
		const curText = document.lineAt(lineNumber-1).text;
		// 1. 找到对应cpp文件
		// 2. 找到对应的插入位置
		// 3. 生成skeleton
		const fullText = document.getText();
		let className = getClassName(fullText, range.start.line)
		const imp = curText.replace(/;$/, '{')

		// 4. 插入函数skeleton
		edit.changes![document.uri] = 	[ 	coc.TextEdit.insert(pos, className), 
											coc.TextEdit.insert({line:lineNumber+1, character:0}, imp)
										]

		const action = coc.CodeAction.create(
			'add definition',
			edit,
			coc.CodeActionKind.QuickFix
		);


		return action;
	}

}
