import { log } from 'console'
import { stat, statSync } from 'fs'
import { TerminalOptions, ExtensionContext, window, Terminal } from 'coc.nvim'

// 勾用没有，插件都激活不了，执行不到这里
export function checkEnv(context: ExtensionContext): boolean {
    // build/Release/ tree-sitter.node add-ons
    let path = context.extensionPath
    log('====path:', path)
    // 1. 判断tree_sitter_runtime_binding.node是否存在
    let tree_sitter_runtime_binding =
        path +
        '/node_modules/tree-sitter/build/Release/tree_sitter_runtime_binding.node'
    let ret = false

    try {
        statSync(tree_sitter_runtime_binding)
        ret = true
        log('tree_sitter_runtime_binding存在')
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            ret = false // 文件不存在
            log('tree_sitter_runtime_binding.node不存在')
        } else {
            // 处理其他潜在的错误
            console.error(err)
        }
    }
    // stat(tree_sitter_runtime_binding, (err, _stat) => {
    //     if (err) {
    //         if (err.code === 'ENOENT') {
    //             ret = false
    //             log('tree_sitter_runtime_binding.node不存在')
    //             const opts: TerminalOptions = {
    //                 name: 'prebuild',
    //                 shellPath: 'ls',
    //             }
    //             let terminal = window.createTerminal(opts)
    //             if (!terminal) {
    //                 window.showInformationMessage('Create terminal failed')
    //                 return
    //             }
    //         }
    //     } else {
    //         ret = true
    //         log('tree_sitter_runtime_binding存在')
    //         return
    //     }
    // })

    return ret
}
