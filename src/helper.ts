import { log } from 'console'
import { stat } from 'fs'
import { TerminalOptions, ExtensionContext, window } from 'coc.nvim'

// 勾用没有，插件都激活不了，执行不到这里
export function checkEnv(context: ExtensionContext) {
    // build/Release/ tree-sitter.node add-ons
    let path = context.extensionPath
    log('====path:', path)
    // 1. 判断tree_sitter_runtime_binding.node是否存在
    let tree_sitter_runtime_binding =
        path +
        'node_modules/tree-sitter/build/Release/tree_sitter_runtime_binding.node'
    stat(tree_sitter_runtime_binding, (err, _stat) => {
        if (err) {
            if (err.code === 'ENOENT') {
                log('tree_sitter_runtime_binding.node不存在')
                const opts: TerminalOptions = {
                    name: 'prebuild',
                    shellPath: 'ls',
                }
                let terminal = window.createTerminal(opts)
                if (!terminal) {
                    window.showInformationMessage('Create terminal failed')
                    return
                }
            }
        } else {
            log('tree_sitter_runtime_binding存在')
        }
    })
}
