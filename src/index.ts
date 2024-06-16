import {
    commands,
    CompleteResult,
    ExtensionContext,
    listManager,
    sources,
    window,
    workspace,
    DocumentSelector,
    languages,
    nvim,
    Terminal,
    TerminalOptions,
    TerminalResult,
} from 'coc.nvim'
import DemoList from './lists'
import { checkEnv } from './helper'

const documentSelector: DocumentSelector = [
    { scheme: 'file', language: 'c' },
    { scheme: 'file', language: 'cpp' },
]

function registCodeAction(context: ExtensionContext) {
    import('./CodeActionProvider')
        .then(({ CodeActionProvider }) => {
            const codeActionProvider = new CodeActionProvider()
            console.log(codeActionProvider)
            context.subscriptions.push(
                languages.registerCodeActionProvider(
                    documentSelector,
                    codeActionProvider,
                    'clangd' // 提供者标识符
                )
            )
        })
        .catch((err) => {
            console.error('Failed to load CodeActionProvider', err)
        })
}

export async function activate(context: ExtensionContext): Promise<void> {
    window.showInformationMessage('coc-mantic works!')
    const isOk = checkEnv(context)
    console.log('=====isOK是', isOk)
    if (isOk) {
        registCodeAction(context)
    } else {
        const cwd = context.extensionPath + '/node_modules/tree-sitter'
        console.log(cwd)
        window.runTerminalCommand('npm run rebuild', cwd, true).then(
            (result: TerminalResult) => {
                if (result.success) {
                    registCodeAction(context)
                }
            },
            (reason: any) => {
                console.log('npm run rebuild失败')
                console.log(reason)
            }
        )
    }

    context.subscriptions.push(
        // 注册commands
        commands.registerCommand('_internal.copy', async (str) => {
            nvim.call('setreg', ['"', str])
        }),
        commands.registerCommand('coc-mantic.Echo', async () => {
            window.showInformationMessage('coc-mantic Echo!')
        }),

        // 注册list
        listManager.registerList(new DemoList()),

        sources.createSource({
            name: 'coc-mantic completion source', // unique id
            doComplete: async () => {
                const items = await getCompletionItems()
                return items
            },
        }),

        // 注册keymap
        workspace.registerKeymap(
            ['n'],
            'mantic-keymap',
            async () => {
                window.showInformationMessage('registerKeymap')
            },
            { sync: false }
        ),

        // 注册autocmd
        workspace.registerAutocmd({
            event: 'InsertLeave',
            request: true,
            callback: () => {
                window.showInformationMessage('registerAutocmd on InsertLeave')
            },
        })
    )
}

async function getCompletionItems(): Promise<CompleteResult> {
    return {
        items: [
            {
                word: 'TestCompletionItem 1',
                menu: '[coc-mantic]',
            },
            {
                word: 'TestCompletionItem 2',
                menu: '[coc-mantic]',
            },
        ],
    }
}
