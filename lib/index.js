"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(src_exports);
var import_coc3 = require("coc.nvim");

// src/lists.ts
var import_coc = require("coc.nvim");
var DemoList = class extends import_coc.BasicList {
  constructor() {
    super();
    this.name = "demo_list";
    this.description = "CocList for coc-mantic";
    this.defaultAction = "open";
    this.actions = [];
    this.addAction("open", (item) => {
      import_coc.window.showInformationMessage(`${item.label}, ${item.data.name}`);
    });
  }
  async loadItems(context) {
    return [
      {
        label: "coc-mantic list item 1",
        data: { name: "list item 1" }
      },
      {
        label: "coc-mantic list item 2",
        data: { name: "list item 2" }
      }
    ];
  }
};

// src/CodeActionProvider.ts
var coc = __toESM(require("coc.nvim"));
var import_coc2 = require("coc.nvim");

// src/tree.ts
var import_tree_sitter = __toESM(require("tree-sitter"));
var import_tree_sitter_cpp = __toESM(require("tree-sitter-cpp"));
var parser = new import_tree_sitter.default();
parser.setLanguage(import_tree_sitter_cpp.default);
function getNodeInfo(sourceCode, row, colum) {
  const tree = parser.parse(sourceCode);
  let info = {
    isFunction: false,
    functionName: "",
    className: ""
  };
  let curNode = tree.rootNode.descendantForPosition({
    row,
    column: colum
  });
  let classNode = curNode.closest("class_specifier");
  if (classNode) {
    if (row > classNode.startPosition.row && row < classNode.endPosition.row) {
      info.className = classNode.firstNamedChild?.text ?? "";
    }
  }
  let parentType = curNode.parent?.type;
  if (parentType == "function_declarator") {
    info.isFunction = true;
    info.functionName = curNode.text;
    info.funcStartPos = curNode.startPosition;
  }
  return info;
}

// src/CodeActionProvider.ts
var SwitchSourceHeaderRequest;
((SwitchSourceHeaderRequest2) => {
  SwitchSourceHeaderRequest2.type = new import_coc2.RequestType(
    "textDocument/switchSourceHeader"
  );
})(SwitchSourceHeaderRequest || (SwitchSourceHeaderRequest = {}));
var CodeActionProvider = class {
  provideCodeActions(document, range, context, token) {
    const actions = [this.addDefinition(document, range)];
    return actions.flat();
  }
  addDefinition(document, range) {
    const edit = {
      changes: {}
    };
    const curLine = range.start.line + 1;
    const pos = { line: curLine, character: 0 };
    const originText = document.lineAt(curLine - 1).text;
    const curText = originText.trim();
    const fullText = document.getText();
    const info = getNodeInfo(
      fullText,
      range.start.line,
      range.start.character
    );
    console.log("====>", info);
    if (info.isFunction) {
      let skeleton = originText;
      if (info.className != "") {
        skeleton = skeleton.substring(0, info.funcStartPos?.column) + info.className + "::" + skeleton.substring(
          info.funcStartPos?.column ?? skeleton.length - 1
        );
        skeleton = skeleton.trim();
      } else {
        skeleton = curText;
      }
      const imp = skeleton.replace(/;$/, "\n{\n}\n");
      edit.changes[document.uri] = [
        coc.TextEdit.insert(
          { line: document.end.line + 1, character: 0 },
          imp
        )
      ];
      const addDefInHeader = coc.CodeAction.create(
        "add definition in current file",
        edit,
        coc.CodeActionKind.QuickFix
      );
      const copyIntoRegisters = coc.CodeAction.create(
        "copy into registers",
        coc.Command.create("copy", "_internal.copy", imp),
        coc.CodeActionKind.Refactor
      );
      return [copyIntoRegisters, addDefInHeader];
    }
  }
};

// src/index.ts
var codeActionProvider = new CodeActionProvider();
var documentSelector = [
  { scheme: "file", language: "c" },
  { scheme: "file", language: "cpp" }
];
async function activate(context) {
  import_coc3.window.showInformationMessage("coc-mantic works!");
  context.subscriptions.push(
    // 注册commands
    import_coc3.commands.registerCommand("_internal.copy", async (str) => {
      import_coc3.nvim.call("setreg", ['"', str]);
    }),
    import_coc3.commands.registerCommand("coc-mantic.Echo", async () => {
      import_coc3.window.showInformationMessage("coc-mantic Echo!");
    }),
    // 注册codeAction
    import_coc3.languages.registerCodeActionProvider(
      documentSelector,
      codeActionProvider,
      "clangd"
      // 提供者标识符
    ),
    // 注册list
    import_coc3.listManager.registerList(new DemoList()),
    import_coc3.sources.createSource({
      name: "coc-mantic completion source",
      // unique id
      doComplete: async () => {
        const items = await getCompletionItems();
        return items;
      }
    }),
    // 注册keymap
    import_coc3.workspace.registerKeymap(
      ["n"],
      "mantic-keymap",
      async () => {
        import_coc3.window.showInformationMessage("registerKeymap");
      },
      { sync: false }
    ),
    // 注册autocmd
    import_coc3.workspace.registerAutocmd({
      event: "InsertLeave",
      request: true,
      callback: () => {
        import_coc3.window.showInformationMessage("registerAutocmd on InsertLeave");
      }
    })
  );
}
async function getCompletionItems() {
  return {
    items: [
      {
        word: "TestCompletionItem 1",
        menu: "[coc-mantic]"
      },
      {
        word: "TestCompletionItem 2",
        menu: "[coc-mantic]"
      }
    ]
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
