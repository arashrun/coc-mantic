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
function getClassName(sourceCode, row, colum) {
  const parser = new import_tree_sitter.default();
  parser.setLanguage(import_tree_sitter_cpp.default);
  const tree = parser.parse(sourceCode);
  let classname = "";
  for (let i = 0; i < tree.rootNode.namedChildCount; i++) {
    let node = tree.rootNode.namedChildren[i];
    if (node.type == "class_specifier") {
      if (row > node.startPosition.row && row < node.endPosition.row) {
        let classChildren = node.namedChildren;
        classChildren.find((child, index) => {
          if (child.type == "type_identifier") {
            classname = child.text;
            return child.text;
          }
        });
      }
    }
  }
  return classname;
}

// src/CodeActionProvider.ts
var SwitchSourceHeaderRequest;
((SwitchSourceHeaderRequest2) => {
  SwitchSourceHeaderRequest2.type = new import_coc2.RequestType("textDocument/switchSourceHeader");
})(SwitchSourceHeaderRequest || (SwitchSourceHeaderRequest = {}));
var CodeActionProvider = class {
  provideCodeActions(document, range, context, token) {
    const actions = [
      this.addDefinition(document, range)
    ];
    return actions;
  }
  addDefinition(document, range) {
    const edit = {
      changes: {}
    };
    const lineNumber = range.start.line + 1;
    const pos = { line: lineNumber, character: 0 };
    const curText = document.lineAt(lineNumber - 1).text;
    const fullText = document.getText();
    const className = getClassName(fullText, range.start.line);
    const imp = curText.replace(/;$/, "{\n}\n");
    edit.changes[document.uri] = [
      coc.TextEdit.insert(pos, className),
      coc.TextEdit.insert({ line: lineNumber + 1, character: 0 }, imp)
    ];
    const action = coc.CodeAction.create(
      "add definition",
      edit,
      coc.CodeActionKind.QuickFix
    );
    return action;
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
    import_coc3.commands.registerCommand("coc-mantic.Command", async () => {
      import_coc3.window.showInformationMessage("coc-mantic Commands works! : add definition");
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
