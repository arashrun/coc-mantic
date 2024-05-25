import * as coc from 'coc.nvim'
import { RequestType, type TextDocumentIdentifier, type TextDocumentPositionParams, Uri, window, workspace } from 'coc.nvim'
import { getNodeInfo, type nodeInfo } from './tree';


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

		const curLine = range.start.line + 1;
		const pos :coc.Position= {line:curLine, character: 0};
		const curText = document.lineAt(curLine-1).text.trim();
		// 3. 生成skeleton
		const fullText = document.getText();
		const info = getNodeInfo(fullText, range.start.line, range.start.character)
		if(info.isFunction) {

			const imp = curText.replace(/;$/, '\n{\n}\n')

			// 4. 插入函数skeleton
			edit.changes![document.uri] = 	[ 	coc.TextEdit.insert(pos, info.className), 
												coc.TextEdit.insert({line:curLine+1, character:0}, imp)
											]

		}
		const action = coc.CodeAction.create(
			'add definition',
			edit,
			coc.CodeActionKind.QuickFix
		);


		return action;
	}

}
