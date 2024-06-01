import * as coc from 'coc.nvim'
import {
    RequestType,
    type TextDocumentIdentifier,
    type TextDocumentPositionParams,
    Uri,
    window,
    workspace,
} from 'coc.nvim'
import { getNodeInfo, type nodeInfo } from './tree'

namespace SwitchSourceHeaderRequest {
    export const type = new RequestType<TextDocumentIdentifier, string, void>(
        'textDocument/switchSourceHeader'
    )
}

export class CodeActionProvider implements coc.CodeActionProvider {
    provideCodeActions(
        document: coc.LinesTextDocument,
        range: coc.Range,
        context: coc.CodeActionContext,
        token: coc.CancellationToken
    ): coc.ProviderResult<(coc.CodeAction | coc.Command)[]> {
        const actions: coc.CodeAction[] = [this.addDefinition(document, range)]

        return actions.flat()
    }

    private addDefinition(
        document: coc.LinesTextDocument,
        range: coc.Range
    ): coc.CodeAction | any {
        const edit: coc.WorkspaceEdit = {
            changes: {},
        }

        const curLine = range.start.line + 1
        const pos: coc.Position = { line: curLine, character: 0 }
        const originText = document.lineAt(curLine - 1).text
        const curText = originText.trim()
        const fullText = document.getText()
        // 获取函数节点信息
        const info = getNodeInfo(
            fullText,
            range.start.line,
            range.start.character
        )
        console.log('====>', info)
        if (info.isFunction) {
            let skeleton = originText

            // 3. 生成skeleton
            if (info.className != '') {
                skeleton =
                    skeleton.substring(0, info.funcStartPos?.column) +
                    info.className +
                    '::' +
                    skeleton.substring(
                        info.funcStartPos?.column ?? skeleton.length - 1
                    )
                skeleton = skeleton.trim()
            } else {
                skeleton = curText
            }

            const imp = skeleton.replace(/;$/, '\n{\n}\n')

			// add definition in header
            edit.changes![document.uri] = [
                coc.TextEdit.insert(
                    { line: document.end.line + 1, character: 0 },
                    imp
                ),
            ]
            const addDefInHeader = coc.CodeAction.create(
                'add definition in current file',
                edit,
                coc.CodeActionKind.QuickFix
            )

			// copy skeleton into registers
			const copyIntoRegisters = coc.CodeAction.create(
				'copy definition into registers',
				coc.Command.create('copy', '_internal.copy', imp),
				coc.CodeActionKind.Refactor
			)

            return [copyIntoRegisters, addDefInHeader]
        }
    }
}
