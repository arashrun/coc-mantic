import {
	commands, CompleteResult, ExtensionContext, listManager, sources, window, workspace,
	DocumentSelector,
	languages,
	CodeAction,
	Command
} from 'coc.nvim';
import DemoList from './lists';
import { CodeActionProvider } from './CodeActionProvider';

const codeActionProvider = new CodeActionProvider();
const documentSelector: DocumentSelector = [
	{scheme: 'file', language: 'c'},
	{scheme: 'file', language: 'cpp'}
];

export async function activate(context: ExtensionContext): Promise<void> {
  window.showInformationMessage('coc-mantic works!');

  context.subscriptions.push(
	// 注册commands
    commands.registerCommand('coc-mantic.Command', async () => {
      window.showInformationMessage('coc-mantic Commands works! : add definition');
    }),

	// 注册codeAction
	languages.registerCodeActionProvider(
		documentSelector,
		codeActionProvider,
		'clangd' // 提供者标识符
	),

	// 注册list
    listManager.registerList(new DemoList()),

    sources.createSource({
      name: 'coc-mantic completion source', // unique id
      doComplete: async () => {
        const items = await getCompletionItems();
        return items;
      },
    }),

	// 注册keymap
    workspace.registerKeymap(
      ['n'],
      'mantic-keymap',
      async () => {
        window.showInformationMessage('registerKeymap');
      },
      { sync: false }
    ),

	// 注册autocmd
    workspace.registerAutocmd({
      event: 'InsertLeave',
      request: true,
      callback: () => {
        window.showInformationMessage('registerAutocmd on InsertLeave');
      },
    })
  );
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
  };
}
