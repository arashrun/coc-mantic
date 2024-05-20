"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/node-gyp-build/node-gyp-build.js
var require_node_gyp_build = __commonJS({
  "node_modules/node-gyp-build/node-gyp-build.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var abi = process.versions.modules;
    var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
    var arch = process.env.npm_config_arch || os.arch();
    var platform = process.env.npm_config_platform || os.platform();
    var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (process.versions.uv || "").split(".")[0];
    module2.exports = load;
    function load(dir) {
      return runtimeRequire(load.resolve(dir));
    }
    load.resolve = load.path = function(dir) {
      dir = path.resolve(dir || ".");
      try {
        var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
        if (process.env[name + "_PREBUILD"])
          dir = process.env[name + "_PREBUILD"];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path.join(dir, "build/Release"), matchBuild);
        if (release)
          return release;
        var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
        if (debug)
          return debug;
      }
      var prebuild = resolve(dir);
      if (prebuild)
        return prebuild;
      var nearby = resolve(path.dirname(process.execPath));
      if (nearby)
        return nearby;
      var target = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
      function resolve(dir2) {
        var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple)
          return;
        var prebuilds = path.join(dir2, "prebuilds", tuple.name);
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner)
          return path.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr = name.split("-");
      if (arr.length !== 2)
        return;
      var platform2 = arr[0];
      var architectures = arr[1].split("+");
      if (!platform2)
        return;
      if (!architectures.length)
        return;
      if (!architectures.every(Boolean))
        return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null)
          return false;
        if (tuple.platform !== platform2)
          return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension !== "node")
        return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null)
          return false;
        if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags))
          return false;
        if (tags.abi && tags.abi !== abi2 && !tags.napi)
          return false;
        if (tags.uv && tags.uv !== uv)
          return false;
        if (tags.armv && tags.armv !== armv)
          return false;
        if (tags.libc && tags.libc !== libc)
          return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isNwjs() {
      return !!(process.versions && process.versions.nw);
    }
    function isElectron() {
      if (process.versions && process.versions.electron)
        return true;
      if (process.env.ELECTRON_RUN_AS_NODE)
        return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isAlpine(platform2) {
      return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});

// node_modules/node-gyp-build/index.js
var require_node_gyp_build2 = __commonJS({
  "node_modules/node-gyp-build/index.js"(exports2, module2) {
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    if (typeof runtimeRequire.addon === "function") {
      module2.exports = runtimeRequire.addon.bind(runtimeRequire);
    } else {
      module2.exports = require_node_gyp_build();
    }
  }
});

// node_modules/tree-sitter/index.js
var require_tree_sitter = __commonJS({
  "node_modules/tree-sitter/index.js"(exports, module) {
    var binding = require_node_gyp_build2()(__dirname);
    var { Query, Parser, NodeMethods, Tree, TreeCursor, LookaheadIterator } = binding;
    var util = require("util");
    var { rootNode, rootNodeWithOffset, edit } = Tree.prototype;
    Object.defineProperty(Tree.prototype, "rootNode", {
      get() {
        if (this instanceof Tree && rootNode) {
          return unmarshalNode(rootNode.call(this), this);
        }
      },
      // Jest worker pool may attempt to override property due to race condition,
      // we don't want to error on this
      configurable: true
    });
    Tree.prototype.rootNodeWithOffset = function(offset_bytes, offset_extent) {
      return unmarshalNode(rootNodeWithOffset.call(this, offset_bytes, offset_extent.row, offset_extent.column), this);
    };
    Tree.prototype.edit = function(arg) {
      if (this instanceof Tree && edit) {
        edit.call(
          this,
          arg.startPosition.row,
          arg.startPosition.column,
          arg.oldEndPosition.row,
          arg.oldEndPosition.column,
          arg.newEndPosition.row,
          arg.newEndPosition.column,
          arg.startIndex,
          arg.oldEndIndex,
          arg.newEndIndex
        );
      }
    };
    Tree.prototype.walk = function() {
      return this.rootNode.walk();
    };
    var SyntaxNode = class {
      constructor(tree) {
        this.tree = tree;
      }
      [util.inspect.custom]() {
        return this.constructor.name + " {\n  type: " + this.type + ",\n  startPosition: " + pointToString(this.startPosition) + ",\n  endPosition: " + pointToString(this.endPosition) + ",\n  childCount: " + this.childCount + ",\n}";
      }
      get id() {
        marshalNode(this);
        return NodeMethods.id(this.tree);
      }
      get typeId() {
        marshalNode(this);
        return NodeMethods.typeId(this.tree);
      }
      get grammarId() {
        marshalNode(this);
        return NodeMethods.grammarId(this.tree);
      }
      get type() {
        marshalNode(this);
        return NodeMethods.type(this.tree);
      }
      get grammarType() {
        marshalNode(this);
        return NodeMethods.grammarType(this.tree);
      }
      get isExtra() {
        marshalNode(this);
        return NodeMethods.isExtra(this.tree);
      }
      get isNamed() {
        marshalNode(this);
        return NodeMethods.isNamed(this.tree);
      }
      get isMissing() {
        marshalNode(this);
        return NodeMethods.isMissing(this.tree);
      }
      get hasChanges() {
        marshalNode(this);
        return NodeMethods.hasChanges(this.tree);
      }
      get hasError() {
        marshalNode(this);
        return NodeMethods.hasError(this.tree);
      }
      get isError() {
        marshalNode(this);
        return NodeMethods.isError(this.tree);
      }
      get text() {
        return this.tree.getText(this);
      }
      get startPosition() {
        marshalNode(this);
        NodeMethods.startPosition(this.tree);
        return unmarshalPoint();
      }
      get endPosition() {
        marshalNode(this);
        NodeMethods.endPosition(this.tree);
        return unmarshalPoint();
      }
      get startIndex() {
        marshalNode(this);
        return NodeMethods.startIndex(this.tree);
      }
      get endIndex() {
        marshalNode(this);
        return NodeMethods.endIndex(this.tree);
      }
      get parent() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.parent(this.tree), this.tree);
      }
      get children() {
        marshalNode(this);
        return unmarshalNodes(NodeMethods.children(this.tree), this.tree);
      }
      get namedChildren() {
        marshalNode(this);
        return unmarshalNodes(NodeMethods.namedChildren(this.tree), this.tree);
      }
      get childCount() {
        marshalNode(this);
        return NodeMethods.childCount(this.tree);
      }
      get namedChildCount() {
        marshalNode(this);
        return NodeMethods.namedChildCount(this.tree);
      }
      get firstChild() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.firstChild(this.tree), this.tree);
      }
      get firstNamedChild() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.firstNamedChild(this.tree), this.tree);
      }
      get lastChild() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.lastChild(this.tree), this.tree);
      }
      get lastNamedChild() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.lastNamedChild(this.tree), this.tree);
      }
      get nextSibling() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.nextSibling(this.tree), this.tree);
      }
      get nextNamedSibling() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.nextNamedSibling(this.tree), this.tree);
      }
      get previousSibling() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.previousSibling(this.tree), this.tree);
      }
      get previousNamedSibling() {
        marshalNode(this);
        return unmarshalNode(NodeMethods.previousNamedSibling(this.tree), this.tree);
      }
      get parseState() {
        marshalNode(this);
        return NodeMethods.parseState(this.tree);
      }
      get nextParseState() {
        marshalNode(this);
        return NodeMethods.nextParseState(this.tree);
      }
      get descendantCount() {
        marshalNode(this);
        return NodeMethods.descendantCount(this.tree);
      }
      toString() {
        marshalNode(this);
        return NodeMethods.toString(this.tree);
      }
      child(index) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.child(this.tree, index), this.tree);
      }
      namedChild(index) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.namedChild(this.tree, index), this.tree);
      }
      childForFieldName(fieldName) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.childForFieldName(this.tree, fieldName), this.tree);
      }
      childForFieldId(fieldId) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.childForFieldId(this.tree, fieldId), this.tree);
      }
      fieldNameForChild(childIndex) {
        marshalNode(this);
        return NodeMethods.fieldNameForChild(this.tree, childIndex);
      }
      childrenForFieldName(fieldName) {
        marshalNode(this);
        return unmarshalNodes(NodeMethods.childrenForFieldName(this.tree, fieldName), this.tree);
      }
      childrenForFieldId(fieldId) {
        marshalNode(this);
        return unmarshalNodes(NodeMethods.childrenForFieldId(this.tree, fieldId), this.tree);
      }
      firstChildForIndex(index) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.firstChildForIndex(this.tree, index), this.tree);
      }
      firstNamedChildForIndex(index) {
        marshalNode(this);
        return unmarshalNode(NodeMethods.firstNamedChildForIndex(this.tree, index), this.tree);
      }
      namedDescendantForIndex(start, end) {
        marshalNode(this);
        if (end == null)
          end = start;
        return unmarshalNode(NodeMethods.namedDescendantForIndex(this.tree, start, end), this.tree);
      }
      descendantForIndex(start, end) {
        marshalNode(this);
        if (end == null)
          end = start;
        return unmarshalNode(NodeMethods.descendantForIndex(this.tree, start, end), this.tree);
      }
      descendantsOfType(types, start, end) {
        marshalNode(this);
        if (typeof types === "string")
          types = [types];
        return unmarshalNodes(NodeMethods.descendantsOfType(this.tree, types, start, end), this.tree);
      }
      namedDescendantForPosition(start, end) {
        marshalNode(this);
        if (end == null)
          end = start;
        return unmarshalNode(NodeMethods.namedDescendantForPosition(this.tree, start, end), this.tree);
      }
      descendantForPosition(start, end) {
        marshalNode(this);
        if (end == null)
          end = start;
        return unmarshalNode(NodeMethods.descendantForPosition(this.tree, start, end), this.tree);
      }
      closest(types) {
        marshalNode(this);
        if (typeof types === "string")
          types = [types];
        return unmarshalNode(NodeMethods.closest(this.tree, types), this.tree);
      }
      walk() {
        marshalNode(this);
        const cursor = NodeMethods.walk(this.tree);
        cursor.tree = this.tree;
        unmarshalNode(cursor.currentNode, this.tree);
        return cursor;
      }
    };
    var { parse, setLanguage } = Parser.prototype;
    var languageSymbol = Symbol("parser.language");
    Parser.prototype.setLanguage = function(language3) {
      if (this instanceof Parser && setLanguage) {
        setLanguage.call(this, language3);
      }
      this[languageSymbol] = language3;
      if (!language3.nodeSubclasses) {
        initializeLanguageNodeClasses(language3);
      }
      return this;
    };
    Parser.prototype.getLanguage = function(_language) {
      return this[languageSymbol] || null;
    };
    Parser.prototype.parse = function(input, oldTree, { bufferSize, includedRanges } = {}) {
      let getText, treeInput = input;
      if (typeof input === "string") {
        const inputString = input;
        input = (offset, _position) => inputString.slice(offset);
        getText = getTextFromString;
      } else {
        getText = getTextFromFunction;
      }
      const tree = this instanceof Parser && parse ? parse.call(
        this,
        input,
        oldTree,
        bufferSize,
        includedRanges
      ) : void 0;
      if (tree) {
        tree.input = treeInput;
        tree.getText = getText;
        tree.language = this.getLanguage();
      }
      return tree;
    };
    var { startPosition, endPosition, currentNode } = TreeCursor.prototype;
    Object.defineProperties(TreeCursor.prototype, {
      currentNode: {
        get() {
          if (this instanceof TreeCursor && currentNode) {
            return unmarshalNode(currentNode.call(this), this.tree);
          }
        },
        configurable: true
      },
      startPosition: {
        get() {
          if (this instanceof TreeCursor && startPosition) {
            startPosition.call(this);
            return unmarshalPoint();
          }
        },
        configurable: true
      },
      endPosition: {
        get() {
          if (this instanceof TreeCursor && endPosition) {
            endPosition.call(this);
            return unmarshalPoint();
          }
        },
        configurable: true
      },
      nodeText: {
        get() {
          return this.tree.getText(this);
        },
        configurable: true
      }
    });
    var { _matches, _captures } = Query.prototype;
    var PREDICATE_STEP_TYPE = {
      DONE: 0,
      CAPTURE: 1,
      STRING: 2
    };
    var ZERO_POINT = { row: 0, column: 0 };
    Query.prototype._init = function() {
      const predicateDescriptions = this._getPredicates();
      const patternCount = predicateDescriptions.length;
      const setProperties = new Array(patternCount);
      const assertedProperties = new Array(patternCount);
      const refutedProperties = new Array(patternCount);
      const predicates = new Array(patternCount);
      const FIRST = 0;
      const SECOND = 2;
      const THIRD = 4;
      for (let i = 0; i < predicateDescriptions.length; i++) {
        predicates[i] = [];
        for (let j = 0; j < predicateDescriptions[i].length; j++) {
          const steps = predicateDescriptions[i][j];
          const stepsLength = steps.length / 2;
          if (steps[FIRST] !== PREDICATE_STEP_TYPE.STRING) {
            throw new Error("Predicates must begin with a literal value");
          }
          const operator = steps[FIRST + 1];
          let isPositive = true;
          let matchAll = true;
          let captureName;
          switch (operator) {
            case "any-not-eq?":
            case "not-eq?":
              isPositive = false;
            case "any-eq?":
            case "eq?":
              if (stepsLength !== 3)
                throw new Error(
                  `Wrong number of arguments to \`#eq?\` predicate. Expected 2, got ${stepsLength - 1}`
                );
              if (steps[SECOND] !== PREDICATE_STEP_TYPE.CAPTURE)
                throw new Error(
                  `First argument of \`#eq?\` predicate must be a capture. Got "${steps[SECOND + 1]}"`
                );
              matchAll = !operator.startsWith("any-");
              if (steps[THIRD] === PREDICATE_STEP_TYPE.CAPTURE) {
                const captureName1 = steps[SECOND + 1];
                const captureName2 = steps[THIRD + 1];
                predicates[i].push(function(captures) {
                  let nodes_1 = [];
                  let nodes_2 = [];
                  for (const c of captures) {
                    if (c.name === captureName1)
                      nodes_1.push(c.node);
                    if (c.name === captureName2)
                      nodes_2.push(c.node);
                  }
                  let compare = (n1, n2, positive) => {
                    return positive ? n1.text === n2.text : n1.text !== n2.text;
                  };
                  return matchAll ? nodes_1.every((n1) => nodes_2.some((n2) => compare(n1, n2, isPositive))) : nodes_1.some((n1) => nodes_2.some((n2) => compare(n1, n2, isPositive)));
                });
              } else {
                captureName = steps[SECOND + 1];
                const stringValue = steps[THIRD + 1];
                let matches = (n2) => n2.text === stringValue;
                let doesNotMatch = (n2) => n2.text !== stringValue;
                predicates[i].push(function(captures) {
                  let nodes = [];
                  for (const c of captures) {
                    if (c.name === captureName)
                      nodes.push(c.node);
                  }
                  let test = isPositive ? matches : doesNotMatch;
                  return matchAll ? nodes.every(test) : nodes.some(test);
                });
              }
              break;
            case "any-not-match?":
            case "not-match?":
              isPositive = false;
            case "any-match?":
            case "match?":
              if (stepsLength !== 3)
                throw new Error(
                  `Wrong number of arguments to \`#match?\` predicate. Expected 2, got ${stepsLength - 1}.`
                );
              if (steps[SECOND] !== PREDICATE_STEP_TYPE.CAPTURE)
                throw new Error(
                  `First argument of \`#match?\` predicate must be a capture. Got "${steps[SECOND + 1]}".`
                );
              if (steps[THIRD] !== PREDICATE_STEP_TYPE.STRING)
                throw new Error(
                  `Second argument of \`#match?\` predicate must be a string. Got @${steps[THIRD + 1]}.`
                );
              captureName = steps[SECOND + 1];
              const regex = new RegExp(steps[THIRD + 1]);
              matchAll = !operator.startsWith("any-");
              predicates[i].push(function(captures) {
                const nodes = [];
                for (const c of captures) {
                  if (c.name === captureName)
                    nodes.push(c.node.text);
                }
                let test = (text, positive) => {
                  return positive ? regex.test(text) : !regex.test(text);
                };
                if (nodes.length === 0)
                  return !isPositive;
                return matchAll ? nodes.every((text) => test(text, isPositive)) : nodes.some((text) => test(text, isPositive));
              });
              break;
            case "set!":
              if (stepsLength < 2 || stepsLength > 3)
                throw new Error(
                  `Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${stepsLength - 1}.`
                );
              if (steps.some((s, i2) => i2 % 2 !== 1 && s !== PREDICATE_STEP_TYPE.STRING))
                throw new Error(
                  `Arguments to \`#set!\` predicate must be a strings.".`
                );
              if (!setProperties[i])
                setProperties[i] = {};
              setProperties[i][steps[SECOND + 1]] = steps[THIRD] ? steps[THIRD + 1] : null;
              break;
            case "is?":
            case "is-not?":
              if (stepsLength < 2 || stepsLength > 3)
                throw new Error(
                  `Wrong number of arguments to \`#${operator}\` predicate. Expected 1 or 2. Got ${stepsLength - 1}.`
                );
              if (steps.some((s, i2) => i2 % 2 !== 1 && s !== PREDICATE_STEP_TYPE.STRING))
                throw new Error(
                  `Arguments to \`#${operator}\` predicate must be a strings.".`
                );
              const properties = operator === "is?" ? assertedProperties : refutedProperties;
              if (!properties[i])
                properties[i] = {};
              properties[i][steps[SECOND + 1]] = steps[THIRD] ? steps[THIRD + 1] : null;
              break;
            case "not-any-of?":
              isPositive = false;
            case "any-of?":
              if (stepsLength < 2)
                throw new Error(
                  `Wrong number of arguments to \`#${operator}\` predicate. Expected at least 1. Got ${stepsLength - 1}.`
                );
              if (steps[SECOND] !== PREDICATE_STEP_TYPE.CAPTURE)
                throw new Error(
                  `First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`
                );
              stringValues = [];
              for (let k = THIRD; k < 2 * stepsLength; k += 2) {
                if (steps[k] !== PREDICATE_STEP_TYPE.STRING)
                  throw new Error(
                    `Arguments to \`#${operator}\` predicate must be a strings.".`
                  );
                stringValues.push(steps[k + 1]);
              }
              captureName = steps[SECOND + 1];
              predicates[i].push(function(captures) {
                const nodes = [];
                for (const c of captures) {
                  if (c.name === captureName)
                    nodes.push(c.node.text);
                }
                if (nodes.length === 0)
                  return !isPositive;
                return nodes.every((text) => stringValues.includes(text)) === isPositive;
              });
              break;
            default:
              throw new Error(`Unknown query predicate \`#${steps[FIRST + 1]}\``);
          }
        }
      }
      this.predicates = Object.freeze(predicates);
      this.setProperties = Object.freeze(setProperties);
      this.assertedProperties = Object.freeze(assertedProperties);
      this.refutedProperties = Object.freeze(refutedProperties);
    };
    Query.prototype.matches = function(node, {
      startPosition: startPosition2 = ZERO_POINT,
      endPosition: endPosition2 = ZERO_POINT,
      startIndex = 0,
      endIndex = 0,
      matchLimit = 4294967295,
      maxStartDepth = 4294967295
    } = {}) {
      marshalNode(node);
      const [returnedMatches, returnedNodes] = _matches.call(
        this,
        node.tree,
        startPosition2.row,
        startPosition2.column,
        endPosition2.row,
        endPosition2.column,
        startIndex,
        endIndex,
        matchLimit,
        maxStartDepth
      );
      const nodes = unmarshalNodes(returnedNodes, node.tree);
      const results = [];
      let i = 0;
      let nodeIndex = 0;
      while (i < returnedMatches.length) {
        const patternIndex = returnedMatches[i++];
        const captures = [];
        while (i < returnedMatches.length && typeof returnedMatches[i] === "string") {
          const captureName = returnedMatches[i++];
          captures.push({
            name: captureName,
            node: nodes[nodeIndex++]
          });
        }
        if (this.predicates[patternIndex].every((p) => p(captures))) {
          const result = { pattern: patternIndex, captures };
          const setProperties = this.setProperties[patternIndex];
          const assertedProperties = this.assertedProperties[patternIndex];
          const refutedProperties = this.refutedProperties[patternIndex];
          if (setProperties)
            result.setProperties = setProperties;
          if (assertedProperties)
            result.assertedProperties = assertedProperties;
          if (refutedProperties)
            result.refutedProperties = refutedProperties;
          results.push(result);
        }
      }
      return results;
    };
    Query.prototype.captures = function(node, {
      startPosition: startPosition2 = ZERO_POINT,
      endPosition: endPosition2 = ZERO_POINT,
      startIndex = 0,
      endIndex = 0,
      matchLimit = 4294967295,
      maxStartDepth = 4294967295
    } = {}) {
      marshalNode(node);
      const [returnedMatches, returnedNodes] = _captures.call(
        this,
        node.tree,
        startPosition2.row,
        startPosition2.column,
        endPosition2.row,
        endPosition2.column,
        startIndex,
        endIndex,
        matchLimit,
        maxStartDepth
      );
      const nodes = unmarshalNodes(returnedNodes, node.tree);
      const results = [];
      let i = 0;
      let nodeIndex = 0;
      while (i < returnedMatches.length) {
        const patternIndex = returnedMatches[i++];
        const captureIndex = returnedMatches[i++];
        const captures = [];
        while (i < returnedMatches.length && typeof returnedMatches[i] === "string") {
          const captureName = returnedMatches[i++];
          captures.push({
            name: captureName,
            node: nodes[nodeIndex++]
          });
        }
        if (this.predicates[patternIndex].every((p) => p(captures))) {
          const result = captures[captureIndex];
          const setProperties = this.setProperties[patternIndex];
          const assertedProperties = this.assertedProperties[patternIndex];
          const refutedProperties = this.refutedProperties[patternIndex];
          if (setProperties)
            result.setProperties = setProperties;
          if (assertedProperties)
            result.assertedProperties = assertedProperties;
          if (refutedProperties)
            result.refutedProperties = refutedProperties;
          results.push(result);
        }
      }
      return results;
    };
    LookaheadIterator.prototype[Symbol.iterator] = function() {
      const self = this;
      return {
        next() {
          if (self._next()) {
            return { done: false, value: self.currentType };
          }
          return { done: true, value: "" };
        }
      };
    };
    function getTextFromString(node) {
      return this.input.substring(node.startIndex, node.endIndex);
    }
    function getTextFromFunction({ startIndex, endIndex }) {
      const { input } = this;
      let result = "";
      const goalLength = endIndex - startIndex;
      while (result.length < goalLength) {
        const text = input(startIndex + result.length);
        result += text;
      }
      return result.slice(0, goalLength);
    }
    var { pointTransferArray } = binding;
    var NODE_FIELD_COUNT = 6;
    var ERROR_TYPE_ID = 65535;
    function getID(buffer, offset) {
      const low = BigInt(buffer[offset]);
      const high = BigInt(buffer[offset + 1]);
      return (high << 32n) + low;
    }
    function unmarshalNode(value, tree, offset = 0, cache = null) {
      if (typeof value === "object") {
        const node = value;
        return node;
      }
      const nodeTypeId = value;
      const NodeClass = nodeTypeId === ERROR_TYPE_ID ? SyntaxNode : tree.language.nodeSubclasses[nodeTypeId];
      const { nodeTransferArray } = binding;
      const id2 = getID(nodeTransferArray, offset);
      if (id2 === 0n) {
        return null;
      }
      let cachedResult;
      if (cache && (cachedResult = cache.get(id2)))
        return cachedResult;
      const result = new NodeClass(tree);
      for (let i = 0; i < NODE_FIELD_COUNT; i++) {
        result[i] = nodeTransferArray[offset + i];
      }
      if (cache)
        cache.set(id2, result);
      else
        tree._cacheNode(result);
      return result;
    }
    function unmarshalNodes(nodes, tree) {
      const cache = /* @__PURE__ */ new Map();
      let offset = 0;
      for (let i = 0, { length } = nodes; i < length; i++) {
        const node = unmarshalNode(nodes[i], tree, offset, cache);
        if (node !== nodes[i]) {
          nodes[i] = node;
          offset += NODE_FIELD_COUNT;
        }
      }
      tree._cacheNodes(Array.from(cache.values()));
      return nodes;
    }
    function marshalNode(node) {
      if (!(node.tree instanceof Tree)) {
        throw new TypeError("SyntaxNode must belong to a Tree");
      }
      const { nodeTransferArray } = binding;
      for (let i = 0; i < NODE_FIELD_COUNT; i++) {
        nodeTransferArray[i] = node[i];
      }
    }
    function unmarshalPoint() {
      return { row: pointTransferArray[0], column: pointTransferArray[1] };
    }
    function pointToString(point) {
      return `{row: ${point.row}, column: ${point.column}}`;
    }
    function initializeLanguageNodeClasses(language) {
      const nodeTypeNamesById = binding.getNodeTypeNamesById(language);
      const nodeFieldNamesById = binding.getNodeFieldNamesById(language);
      const nodeTypeInfo = language.nodeTypeInfo || [];
      const nodeSubclasses = [];
      for (let id = 0, n = nodeTypeNamesById.length; id < n; id++) {
        nodeSubclasses[id] = SyntaxNode;
        const typeName = nodeTypeNamesById[id];
        if (!typeName)
          continue;
        const typeInfo = nodeTypeInfo.find((info) => info.named && info.type === typeName);
        if (!typeInfo)
          continue;
        const fieldNames = [];
        let classBody = "\n";
        if (typeInfo.fields) {
          for (const fieldName in typeInfo.fields) {
            const fieldId = nodeFieldNamesById.indexOf(fieldName);
            if (fieldId === -1)
              continue;
            if (typeInfo.fields[fieldName].multiple) {
              const getterName = camelCase(fieldName) + "Nodes";
              fieldNames.push(getterName);
              classBody += `
            get ${getterName}() {
              marshalNode(this);
              return unmarshalNodes(NodeMethods.childNodesForFieldId(this.tree, ${fieldId}), this.tree);
            }
          `.replace(/\s+/g, " ") + "\n";
            } else {
              const getterName = camelCase(fieldName, false) + "Node";
              fieldNames.push(getterName);
              classBody += `
            get ${getterName}() {
              marshalNode(this);
              return unmarshalNode(NodeMethods.childNodeForFieldId(this.tree, ${fieldId}), this.tree);
            }
          `.replace(/\s+/g, " ") + "\n";
            }
          }
        }
        const className = camelCase(typeName, true) + "Node";
        const nodeSubclass = eval(`class ${className} extends SyntaxNode {${classBody}}; ${className}`);
        nodeSubclass.prototype.type = typeName;
        nodeSubclass.prototype.fields = Object.freeze(fieldNames.sort());
        nodeSubclasses[id] = nodeSubclass;
      }
      language.nodeSubclasses = nodeSubclasses;
    }
    function camelCase(name, upperCase) {
      name = name.replace(/_(\w)/g, (_match, letter) => letter.toUpperCase());
      if (upperCase)
        name = name[0].toUpperCase() + name.slice(1);
      return name;
    }
    module.exports = Parser;
    module.exports.Query = Query;
    module.exports.Tree = Tree;
    module.exports.SyntaxNode = SyntaxNode;
    module.exports.TreeCursor = TreeCursor;
    module.exports.LookaheadIterator = LookaheadIterator;
  }
});

// node_modules/tree-sitter-cpp/src/node-types.json
var require_node_types = __commonJS({
  "node_modules/tree-sitter-cpp/src/node-types.json"(exports2, module2) {
    module2.exports = [
      {
        type: "_abstract_declarator",
        named: true,
        subtypes: [
          {
            type: "abstract_array_declarator",
            named: true
          },
          {
            type: "abstract_function_declarator",
            named: true
          },
          {
            type: "abstract_parenthesized_declarator",
            named: true
          },
          {
            type: "abstract_pointer_declarator",
            named: true
          },
          {
            type: "abstract_reference_declarator",
            named: true
          }
        ]
      },
      {
        type: "_declarator",
        named: true,
        subtypes: [
          {
            type: "array_declarator",
            named: true
          },
          {
            type: "attributed_declarator",
            named: true
          },
          {
            type: "destructor_name",
            named: true
          },
          {
            type: "function_declarator",
            named: true
          },
          {
            type: "identifier",
            named: true
          },
          {
            type: "operator_name",
            named: true
          },
          {
            type: "parenthesized_declarator",
            named: true
          },
          {
            type: "pointer_declarator",
            named: true
          },
          {
            type: "qualified_identifier",
            named: true
          },
          {
            type: "reference_declarator",
            named: true
          },
          {
            type: "structured_binding_declarator",
            named: true
          },
          {
            type: "template_function",
            named: true
          }
        ]
      },
      {
        type: "_expression",
        named: true,
        subtypes: [
          {
            type: "alignof_expression",
            named: true
          },
          {
            type: "assignment_expression",
            named: true
          },
          {
            type: "binary_expression",
            named: true
          },
          {
            type: "call_expression",
            named: true
          },
          {
            type: "cast_expression",
            named: true
          },
          {
            type: "char_literal",
            named: true
          },
          {
            type: "co_await_expression",
            named: true
          },
          {
            type: "compound_literal_expression",
            named: true
          },
          {
            type: "concatenated_string",
            named: true
          },
          {
            type: "conditional_expression",
            named: true
          },
          {
            type: "delete_expression",
            named: true
          },
          {
            type: "false",
            named: true
          },
          {
            type: "field_expression",
            named: true
          },
          {
            type: "fold_expression",
            named: true
          },
          {
            type: "generic_expression",
            named: true
          },
          {
            type: "gnu_asm_expression",
            named: true
          },
          {
            type: "identifier",
            named: true
          },
          {
            type: "lambda_expression",
            named: true
          },
          {
            type: "new_expression",
            named: true
          },
          {
            type: "null",
            named: true
          },
          {
            type: "number_literal",
            named: true
          },
          {
            type: "offsetof_expression",
            named: true
          },
          {
            type: "parameter_pack_expansion",
            named: true
          },
          {
            type: "parenthesized_expression",
            named: true
          },
          {
            type: "pointer_expression",
            named: true
          },
          {
            type: "qualified_identifier",
            named: true
          },
          {
            type: "raw_string_literal",
            named: true
          },
          {
            type: "requires_clause",
            named: true
          },
          {
            type: "requires_expression",
            named: true
          },
          {
            type: "sizeof_expression",
            named: true
          },
          {
            type: "string_literal",
            named: true
          },
          {
            type: "subscript_expression",
            named: true
          },
          {
            type: "template_function",
            named: true
          },
          {
            type: "this",
            named: true
          },
          {
            type: "true",
            named: true
          },
          {
            type: "unary_expression",
            named: true
          },
          {
            type: "update_expression",
            named: true
          },
          {
            type: "user_defined_literal",
            named: true
          }
        ]
      },
      {
        type: "_field_declarator",
        named: true,
        subtypes: [
          {
            type: "array_declarator",
            named: true
          },
          {
            type: "attributed_declarator",
            named: true
          },
          {
            type: "field_identifier",
            named: true
          },
          {
            type: "function_declarator",
            named: true
          },
          {
            type: "operator_name",
            named: true
          },
          {
            type: "parenthesized_declarator",
            named: true
          },
          {
            type: "pointer_declarator",
            named: true
          },
          {
            type: "reference_declarator",
            named: true
          },
          {
            type: "template_method",
            named: true
          }
        ]
      },
      {
        type: "_statement",
        named: true,
        subtypes: [
          {
            type: "attributed_statement",
            named: true
          },
          {
            type: "break_statement",
            named: true
          },
          {
            type: "case_statement",
            named: true
          },
          {
            type: "co_return_statement",
            named: true
          },
          {
            type: "co_yield_statement",
            named: true
          },
          {
            type: "compound_statement",
            named: true
          },
          {
            type: "continue_statement",
            named: true
          },
          {
            type: "do_statement",
            named: true
          },
          {
            type: "expression_statement",
            named: true
          },
          {
            type: "for_range_loop",
            named: true
          },
          {
            type: "for_statement",
            named: true
          },
          {
            type: "goto_statement",
            named: true
          },
          {
            type: "if_statement",
            named: true
          },
          {
            type: "labeled_statement",
            named: true
          },
          {
            type: "return_statement",
            named: true
          },
          {
            type: "seh_leave_statement",
            named: true
          },
          {
            type: "seh_try_statement",
            named: true
          },
          {
            type: "switch_statement",
            named: true
          },
          {
            type: "throw_statement",
            named: true
          },
          {
            type: "try_statement",
            named: true
          },
          {
            type: "while_statement",
            named: true
          }
        ]
      },
      {
        type: "_type_declarator",
        named: true,
        subtypes: [
          {
            type: "array_declarator",
            named: true
          },
          {
            type: "attributed_declarator",
            named: true
          },
          {
            type: "function_declarator",
            named: true
          },
          {
            type: "parenthesized_declarator",
            named: true
          },
          {
            type: "pointer_declarator",
            named: true
          },
          {
            type: "primitive_type",
            named: true
          },
          {
            type: "reference_declarator",
            named: true
          },
          {
            type: "type_identifier",
            named: true
          }
        ]
      },
      {
        type: "_type_specifier",
        named: true,
        subtypes: [
          {
            type: "class_specifier",
            named: true
          },
          {
            type: "decltype",
            named: true
          },
          {
            type: "dependent_type",
            named: true
          },
          {
            type: "enum_specifier",
            named: true
          },
          {
            type: "placeholder_type_specifier",
            named: true
          },
          {
            type: "primitive_type",
            named: true
          },
          {
            type: "qualified_identifier",
            named: true
          },
          {
            type: "sized_type_specifier",
            named: true
          },
          {
            type: "struct_specifier",
            named: true
          },
          {
            type: "template_type",
            named: true
          },
          {
            type: "type_identifier",
            named: true
          },
          {
            type: "union_specifier",
            named: true
          }
        ]
      },
      {
        type: "abstract_array_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              }
            ]
          },
          size: {
            multiple: false,
            required: false,
            types: [
              {
                type: "*",
                named: false
              },
              {
                type: "_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "abstract_function_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              }
            ]
          },
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "parameter_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "gnu_asm_expression",
              named: true
            },
            {
              type: "noexcept",
              named: true
            },
            {
              type: "ref_qualifier",
              named: true
            },
            {
              type: "requires_clause",
              named: true
            },
            {
              type: "throw_specifier",
              named: true
            },
            {
              type: "trailing_return_type",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "abstract_parenthesized_declarator",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_abstract_declarator",
              named: true
            },
            {
              type: "ms_call_modifier",
              named: true
            }
          ]
        }
      },
      {
        type: "abstract_pointer_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "ms_pointer_modifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "abstract_reference_declarator",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_abstract_declarator",
              named: true
            }
          ]
        }
      },
      {
        type: "access_specifier",
        named: true,
        fields: {}
      },
      {
        type: "alias_declaration",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_descriptor",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "attribute_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "alignas_specifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "primitive_type",
              named: true
            }
          ]
        }
      },
      {
        type: "alignof_expression",
        named: true,
        fields: {
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_descriptor",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "argument_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "compound_statement",
              named: true
            },
            {
              type: "initializer_list",
              named: true
            },
            {
              type: "preproc_defined",
              named: true
            }
          ]
        }
      },
      {
        type: "array_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "_field_declarator",
                named: true
              },
              {
                type: "_type_declarator",
                named: true
              }
            ]
          },
          size: {
            multiple: false,
            required: false,
            types: [
              {
                type: "*",
                named: false
              },
              {
                type: "_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "assignment_expression",
        named: true,
        fields: {
          left: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "%=",
                named: false
              },
              {
                type: "&=",
                named: false
              },
              {
                type: "*=",
                named: false
              },
              {
                type: "+=",
                named: false
              },
              {
                type: "-=",
                named: false
              },
              {
                type: "/=",
                named: false
              },
              {
                type: "<<=",
                named: false
              },
              {
                type: "=",
                named: false
              },
              {
                type: ">>=",
                named: false
              },
              {
                type: "^=",
                named: false
              },
              {
                type: "and_eq",
                named: false
              },
              {
                type: "or_eq",
                named: false
              },
              {
                type: "xor_eq",
                named: false
              },
              {
                type: "|=",
                named: false
              }
            ]
          },
          right: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "attribute",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          prefix: {
            multiple: false,
            required: false,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "argument_list",
              named: true
            }
          ]
        }
      },
      {
        type: "attribute_declaration",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "attribute",
              named: true
            }
          ]
        }
      },
      {
        type: "attribute_specifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "argument_list",
              named: true
            }
          ]
        }
      },
      {
        type: "attributed_declarator",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_declarator",
              named: true
            },
            {
              type: "_field_declarator",
              named: true
            },
            {
              type: "_type_declarator",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "attributed_statement",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "base_class_clause",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "qualified_identifier",
              named: true
            },
            {
              type: "template_type",
              named: true
            },
            {
              type: "type_identifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "binary_expression",
        named: true,
        fields: {
          left: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "preproc_defined",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "!=",
                named: false
              },
              {
                type: "%",
                named: false
              },
              {
                type: "&",
                named: false
              },
              {
                type: "&&",
                named: false
              },
              {
                type: "*",
                named: false
              },
              {
                type: "+",
                named: false
              },
              {
                type: "-",
                named: false
              },
              {
                type: "/",
                named: false
              },
              {
                type: "<",
                named: false
              },
              {
                type: "<<",
                named: false
              },
              {
                type: "<=",
                named: false
              },
              {
                type: "<=>",
                named: false
              },
              {
                type: "==",
                named: false
              },
              {
                type: ">",
                named: false
              },
              {
                type: ">=",
                named: false
              },
              {
                type: ">>",
                named: false
              },
              {
                type: "^",
                named: false
              },
              {
                type: "and",
                named: false
              },
              {
                type: "bitand",
                named: false
              },
              {
                type: "bitor",
                named: false
              },
              {
                type: "not_eq",
                named: false
              },
              {
                type: "or",
                named: false
              },
              {
                type: "xor",
                named: false
              },
              {
                type: "|",
                named: false
              },
              {
                type: "||",
                named: false
              }
            ]
          },
          right: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "preproc_defined",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "bitfield_clause",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "break_statement",
        named: true,
        fields: {}
      },
      {
        type: "call_expression",
        named: true,
        fields: {
          arguments: {
            multiple: false,
            required: true,
            types: [
              {
                type: "argument_list",
                named: true
              }
            ]
          },
          function: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "primitive_type",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "case_statement",
        named: true,
        fields: {
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "attributed_statement",
              named: true
            },
            {
              type: "break_statement",
              named: true
            },
            {
              type: "co_return_statement",
              named: true
            },
            {
              type: "co_yield_statement",
              named: true
            },
            {
              type: "compound_statement",
              named: true
            },
            {
              type: "continue_statement",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "do_statement",
              named: true
            },
            {
              type: "expression_statement",
              named: true
            },
            {
              type: "for_range_loop",
              named: true
            },
            {
              type: "for_statement",
              named: true
            },
            {
              type: "goto_statement",
              named: true
            },
            {
              type: "if_statement",
              named: true
            },
            {
              type: "labeled_statement",
              named: true
            },
            {
              type: "return_statement",
              named: true
            },
            {
              type: "seh_leave_statement",
              named: true
            },
            {
              type: "seh_try_statement",
              named: true
            },
            {
              type: "switch_statement",
              named: true
            },
            {
              type: "throw_statement",
              named: true
            },
            {
              type: "try_statement",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "while_statement",
              named: true
            }
          ]
        }
      },
      {
        type: "cast_expression",
        named: true,
        fields: {
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_descriptor",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "catch_clause",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          },
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "parameter_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "char_literal",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "character",
              named: true
            },
            {
              type: "escape_sequence",
              named: true
            }
          ]
        }
      },
      {
        type: "class_specifier",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: false,
            types: [
              {
                type: "field_declaration_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "base_class_clause",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "virtual_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "co_await_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "co_await",
                named: false
              }
            ]
          }
        }
      },
      {
        type: "co_return_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "co_yield_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "comma_expression",
        named: true,
        fields: {
          left: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          right: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "compound_literal_expression",
        named: true,
        fields: {
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "primitive_type",
                named: true
              },
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_descriptor",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "initializer_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "compound_requirement",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "trailing_return_type",
              named: true
            }
          ]
        }
      },
      {
        type: "compound_statement",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "concatenated_string",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            },
            {
              type: "raw_string_literal",
              named: true
            },
            {
              type: "string_literal",
              named: true
            }
          ]
        }
      },
      {
        type: "concept_definition",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "condition_clause",
        named: true,
        fields: {
          initializer: {
            multiple: false,
            required: false,
            types: [
              {
                type: "init_statement",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              },
              {
                type: "declaration",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "conditional_expression",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          consequence: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "constraint_conjunction",
        named: true,
        fields: {
          left: {
            multiple: true,
            required: true,
            types: [
              {
                type: "(",
                named: false
              },
              {
                type: ")",
                named: false
              },
              {
                type: "_expression",
                named: true
              },
              {
                type: "constraint_conjunction",
                named: true
              },
              {
                type: "constraint_disjunction",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "&&",
                named: false
              },
              {
                type: "and",
                named: false
              }
            ]
          },
          right: {
            multiple: true,
            required: true,
            types: [
              {
                type: "(",
                named: false
              },
              {
                type: ")",
                named: false
              },
              {
                type: "_expression",
                named: true
              },
              {
                type: "constraint_conjunction",
                named: true
              },
              {
                type: "constraint_disjunction",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "constraint_disjunction",
        named: true,
        fields: {
          left: {
            multiple: true,
            required: true,
            types: [
              {
                type: "(",
                named: false
              },
              {
                type: ")",
                named: false
              },
              {
                type: "_expression",
                named: true
              },
              {
                type: "constraint_conjunction",
                named: true
              },
              {
                type: "constraint_disjunction",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "or",
                named: false
              },
              {
                type: "||",
                named: false
              }
            ]
          },
          right: {
            multiple: true,
            required: true,
            types: [
              {
                type: "(",
                named: false
              },
              {
                type: ")",
                named: false
              },
              {
                type: "_expression",
                named: true
              },
              {
                type: "constraint_conjunction",
                named: true
              },
              {
                type: "constraint_disjunction",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "continue_statement",
        named: true,
        fields: {}
      },
      {
        type: "declaration",
        named: true,
        fields: {
          declarator: {
            multiple: true,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "gnu_asm_expression",
                named: true
              },
              {
                type: "init_declarator",
                named: true
              },
              {
                type: "operator_cast",
                named: true
              }
            ]
          },
          default_value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "explicit_function_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "declaration_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "decltype",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "auto",
              named: true
            }
          ]
        }
      },
      {
        type: "default_method_clause",
        named: true,
        fields: {}
      },
      {
        type: "delete_expression",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "delete_method_clause",
        named: true,
        fields: {}
      },
      {
        type: "dependent_name",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "template_function",
              named: true
            },
            {
              type: "template_method",
              named: true
            },
            {
              type: "template_type",
              named: true
            }
          ]
        }
      },
      {
        type: "dependent_type",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_type_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "destructor_name",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "do_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_statement",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "parenthesized_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "else_clause",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_statement",
              named: true
            }
          ]
        }
      },
      {
        type: "enum_specifier",
        named: true,
        fields: {
          base: {
            multiple: false,
            required: false,
            types: [
              {
                type: "primitive_type",
                named: true
              },
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "sized_type_specifier",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          body: {
            multiple: false,
            required: false,
            types: [
              {
                type: "enumerator_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "attribute_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "enumerator",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "enumerator_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "enumerator",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            }
          ]
        }
      },
      {
        type: "explicit_function_specifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "expression_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "comma_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "field_declaration",
        named: true,
        fields: {
          declarator: {
            multiple: true,
            required: false,
            types: [
              {
                type: "_field_declarator",
                named: true
              }
            ]
          },
          default_value: {
            multiple: true,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "bitfield_clause",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "field_declaration_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "field_designator",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "field_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "field_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          field: {
            multiple: false,
            required: true,
            types: [
              {
                type: "dependent_name",
                named: true
              },
              {
                type: "destructor_name",
                named: true
              },
              {
                type: "field_identifier",
                named: true
              },
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_method",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "->",
                named: false
              },
              {
                type: ".",
                named: false
              },
              {
                type: ".*",
                named: false
              }
            ]
          }
        }
      },
      {
        type: "field_initializer",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "argument_list",
              named: true
            },
            {
              type: "field_identifier",
              named: true
            },
            {
              type: "initializer_list",
              named: true
            },
            {
              type: "qualified_identifier",
              named: true
            },
            {
              type: "template_method",
              named: true
            }
          ]
        }
      },
      {
        type: "field_initializer_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "field_initializer",
              named: true
            }
          ]
        }
      },
      {
        type: "fold_expression",
        named: true,
        fields: {
          left: {
            multiple: false,
            required: true,
            types: [
              {
                type: "...",
                named: false
              },
              {
                type: "_expression",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "!=",
                named: false
              },
              {
                type: "%",
                named: false
              },
              {
                type: "%=",
                named: false
              },
              {
                type: "&",
                named: false
              },
              {
                type: "&&",
                named: false
              },
              {
                type: "&=",
                named: false
              },
              {
                type: "*",
                named: false
              },
              {
                type: "*=",
                named: false
              },
              {
                type: "+",
                named: false
              },
              {
                type: "+=",
                named: false
              },
              {
                type: ",",
                named: false
              },
              {
                type: "-",
                named: false
              },
              {
                type: "-=",
                named: false
              },
              {
                type: "->*",
                named: false
              },
              {
                type: ".*",
                named: false
              },
              {
                type: "/",
                named: false
              },
              {
                type: "/=",
                named: false
              },
              {
                type: "<",
                named: false
              },
              {
                type: "<<",
                named: false
              },
              {
                type: "<<=",
                named: false
              },
              {
                type: "<=",
                named: false
              },
              {
                type: "=",
                named: false
              },
              {
                type: "==",
                named: false
              },
              {
                type: ">",
                named: false
              },
              {
                type: ">=",
                named: false
              },
              {
                type: ">>",
                named: false
              },
              {
                type: ">>=",
                named: false
              },
              {
                type: "^",
                named: false
              },
              {
                type: "^=",
                named: false
              },
              {
                type: "and",
                named: false
              },
              {
                type: "bitand",
                named: false
              },
              {
                type: "bitor",
                named: false
              },
              {
                type: "not_eq",
                named: false
              },
              {
                type: "or",
                named: false
              },
              {
                type: "xor",
                named: false
              },
              {
                type: "|",
                named: false
              },
              {
                type: "|=",
                named: false
              },
              {
                type: "||",
                named: false
              }
            ]
          },
          right: {
            multiple: false,
            required: true,
            types: [
              {
                type: "...",
                named: false
              },
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "for_range_loop",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_statement",
                named: true
              }
            ]
          },
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              }
            ]
          },
          initializer: {
            multiple: false,
            required: false,
            types: [
              {
                type: "init_statement",
                named: true
              }
            ]
          },
          right: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "for_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_statement",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              }
            ]
          },
          initializer: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              },
              {
                type: "declaration",
                named: true
              }
            ]
          },
          update: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "comma_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "friend_declaration",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "qualified_identifier",
              named: true
            },
            {
              type: "template_type",
              named: true
            },
            {
              type: "type_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "function_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "_field_declarator",
                named: true
              },
              {
                type: "_type_declarator",
                named: true
              }
            ]
          },
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "parameter_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "gnu_asm_expression",
              named: true
            },
            {
              type: "noexcept",
              named: true
            },
            {
              type: "ref_qualifier",
              named: true
            },
            {
              type: "requires_clause",
              named: true
            },
            {
              type: "throw_specifier",
              named: true
            },
            {
              type: "trailing_return_type",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "function_definition",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: false,
            types: [
              {
                type: "compound_statement",
                named: true
              },
              {
                type: "try_statement",
                named: true
              }
            ]
          },
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "_field_declarator",
                named: true
              },
              {
                type: "operator_cast",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "default_method_clause",
              named: true
            },
            {
              type: "delete_method_clause",
              named: true
            },
            {
              type: "explicit_function_specifier",
              named: true
            },
            {
              type: "field_initializer_list",
              named: true
            },
            {
              type: "ms_call_modifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "pure_virtual_clause",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "try_statement",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "generic_expression",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "type_descriptor",
              named: true
            }
          ]
        }
      },
      {
        type: "gnu_asm_clobber_list",
        named: true,
        fields: {
          register: {
            multiple: true,
            required: false,
            types: [
              {
                type: "concatenated_string",
                named: true
              },
              {
                type: "string_literal",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_expression",
        named: true,
        fields: {
          assembly_code: {
            multiple: false,
            required: true,
            types: [
              {
                type: "concatenated_string",
                named: true
              },
              {
                type: "string_literal",
                named: true
              }
            ]
          },
          clobbers: {
            multiple: false,
            required: false,
            types: [
              {
                type: "gnu_asm_clobber_list",
                named: true
              }
            ]
          },
          goto_labels: {
            multiple: false,
            required: false,
            types: [
              {
                type: "gnu_asm_goto_list",
                named: true
              }
            ]
          },
          input_operands: {
            multiple: false,
            required: false,
            types: [
              {
                type: "gnu_asm_input_operand_list",
                named: true
              }
            ]
          },
          output_operands: {
            multiple: false,
            required: false,
            types: [
              {
                type: "gnu_asm_output_operand_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "gnu_asm_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "gnu_asm_goto_list",
        named: true,
        fields: {
          label: {
            multiple: true,
            required: false,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_input_operand",
        named: true,
        fields: {
          constraint: {
            multiple: false,
            required: true,
            types: [
              {
                type: "string_literal",
                named: true
              }
            ]
          },
          symbol: {
            multiple: false,
            required: false,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_input_operand_list",
        named: true,
        fields: {
          operand: {
            multiple: true,
            required: false,
            types: [
              {
                type: "gnu_asm_input_operand",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_output_operand",
        named: true,
        fields: {
          constraint: {
            multiple: false,
            required: true,
            types: [
              {
                type: "string_literal",
                named: true
              }
            ]
          },
          symbol: {
            multiple: false,
            required: false,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_output_operand_list",
        named: true,
        fields: {
          operand: {
            multiple: true,
            required: false,
            types: [
              {
                type: "gnu_asm_output_operand",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "gnu_asm_qualifier",
        named: true,
        fields: {}
      },
      {
        type: "goto_statement",
        named: true,
        fields: {
          label: {
            multiple: false,
            required: true,
            types: [
              {
                type: "statement_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "if_statement",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: false,
            types: [
              {
                type: "else_clause",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "condition_clause",
                named: true
              }
            ]
          },
          consequence: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_statement",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "init_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "argument_list",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "init_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "expression_statement",
              named: true
            },
            {
              type: "type_definition",
              named: true
            }
          ]
        }
      },
      {
        type: "initializer_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "initializer_list",
              named: true
            },
            {
              type: "initializer_pair",
              named: true
            }
          ]
        }
      },
      {
        type: "initializer_pair",
        named: true,
        fields: {
          designator: {
            multiple: true,
            required: true,
            types: [
              {
                type: "field_designator",
                named: true
              },
              {
                type: "field_identifier",
                named: true
              },
              {
                type: "subscript_designator",
                named: true
              },
              {
                type: "subscript_range_designator",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "labeled_statement",
        named: true,
        fields: {
          label: {
            multiple: false,
            required: true,
            types: [
              {
                type: "statement_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_statement",
              named: true
            }
          ]
        }
      },
      {
        type: "lambda_capture_specifier",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "lambda_default_capture",
              named: true
            }
          ]
        }
      },
      {
        type: "lambda_default_capture",
        named: true,
        fields: {}
      },
      {
        type: "lambda_expression",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          },
          captures: {
            multiple: false,
            required: true,
            types: [
              {
                type: "lambda_capture_specifier",
                named: true
              }
            ]
          },
          constraint: {
            multiple: false,
            required: false,
            types: [
              {
                type: "requires_clause",
                named: true
              }
            ]
          },
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "abstract_function_declarator",
                named: true
              }
            ]
          },
          template_parameters: {
            multiple: false,
            required: false,
            types: [
              {
                type: "template_parameter_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "linkage_specification",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "declaration",
                named: true
              },
              {
                type: "declaration_list",
                named: true
              },
              {
                type: "function_definition",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "string_literal",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "ms_based_modifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "argument_list",
              named: true
            }
          ]
        }
      },
      {
        type: "ms_call_modifier",
        named: true,
        fields: {}
      },
      {
        type: "ms_declspec_modifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "ms_pointer_modifier",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "ms_restrict_modifier",
              named: true
            },
            {
              type: "ms_signed_ptr_modifier",
              named: true
            },
            {
              type: "ms_unaligned_ptr_modifier",
              named: true
            },
            {
              type: "ms_unsigned_ptr_modifier",
              named: true
            }
          ]
        }
      },
      {
        type: "ms_unaligned_ptr_modifier",
        named: true,
        fields: {}
      },
      {
        type: "namespace_alias_definition",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "namespace_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "namespace_identifier",
              named: true
            },
            {
              type: "nested_namespace_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "namespace_definition",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "declaration_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "namespace_identifier",
                named: true
              },
              {
                type: "nested_namespace_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "attribute_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "nested_namespace_specifier",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "namespace_identifier",
              named: true
            },
            {
              type: "nested_namespace_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "new_declarator",
        named: true,
        fields: {
          length: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "new_declarator",
              named: true
            }
          ]
        }
      },
      {
        type: "new_expression",
        named: true,
        fields: {
          arguments: {
            multiple: false,
            required: false,
            types: [
              {
                type: "argument_list",
                named: true
              },
              {
                type: "initializer_list",
                named: true
              }
            ]
          },
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "new_declarator",
                named: true
              }
            ]
          },
          placement: {
            multiple: false,
            required: false,
            types: [
              {
                type: "argument_list",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "noexcept",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "null",
        named: true,
        fields: {}
      },
      {
        type: "offsetof_expression",
        named: true,
        fields: {
          member: {
            multiple: false,
            required: true,
            types: [
              {
                type: "field_identifier",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_descriptor",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "operator_cast",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "operator_name",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "optional_parameter_declaration",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "abstract_reference_declarator",
                named: true
              }
            ]
          },
          default_value: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "optional_type_parameter_declaration",
        named: true,
        fields: {
          default_type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "parameter_declaration",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              },
              {
                type: "_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "parameter_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "identifier",
              named: true
            },
            {
              type: "optional_parameter_declaration",
              named: true
            },
            {
              type: "parameter_declaration",
              named: true
            },
            {
              type: "variadic_parameter",
              named: true
            },
            {
              type: "variadic_parameter_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "parameter_pack_expansion",
        named: true,
        fields: {
          pattern: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "type_descriptor",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "parenthesized_declarator",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_declarator",
              named: true
            },
            {
              type: "_field_declarator",
              named: true
            },
            {
              type: "_type_declarator",
              named: true
            },
            {
              type: "ms_call_modifier",
              named: true
            }
          ]
        }
      },
      {
        type: "parenthesized_expression",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "comma_expression",
              named: true
            },
            {
              type: "preproc_defined",
              named: true
            }
          ]
        }
      },
      {
        type: "placeholder_type_specifier",
        named: true,
        fields: {
          constraint: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "auto",
              named: true
            },
            {
              type: "decltype",
              named: true
            }
          ]
        }
      },
      {
        type: "pointer_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              },
              {
                type: "_field_declarator",
                named: true
              },
              {
                type: "_type_declarator",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "ms_based_modifier",
              named: true
            },
            {
              type: "ms_pointer_modifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "pointer_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "&",
                named: false
              },
              {
                type: "*",
                named: false
              }
            ]
          }
        }
      },
      {
        type: "pointer_type_declarator",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_declarator",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "ms_based_modifier",
              named: true
            },
            {
              type: "ms_pointer_modifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_call",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_arg",
                named: true
              }
            ]
          },
          directive: {
            multiple: false,
            required: true,
            types: [
              {
                type: "preproc_directive",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "preproc_def",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_arg",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "preproc_defined",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_elif",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_elif",
                named: true
              },
              {
                type: "preproc_else",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "binary_expression",
                named: true
              },
              {
                type: "call_expression",
                named: true
              },
              {
                type: "char_literal",
                named: true
              },
              {
                type: "identifier",
                named: true
              },
              {
                type: "number_literal",
                named: true
              },
              {
                type: "parenthesized_expression",
                named: true
              },
              {
                type: "preproc_defined",
                named: true
              },
              {
                type: "unary_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "enumerator",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_elifdef",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_elif",
                named: true
              },
              {
                type: "preproc_else",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "enumerator",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_else",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "enumerator",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_function_def",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          },
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "preproc_params",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_arg",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "preproc_if",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_elif",
                named: true
              },
              {
                type: "preproc_else",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "binary_expression",
                named: true
              },
              {
                type: "call_expression",
                named: true
              },
              {
                type: "char_literal",
                named: true
              },
              {
                type: "identifier",
                named: true
              },
              {
                type: "number_literal",
                named: true
              },
              {
                type: "parenthesized_expression",
                named: true
              },
              {
                type: "preproc_defined",
                named: true
              },
              {
                type: "unary_expression",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "enumerator",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_ifdef",
        named: true,
        fields: {
          alternative: {
            multiple: false,
            required: false,
            types: [
              {
                type: "preproc_elif",
                named: true
              },
              {
                type: "preproc_elifdef",
                named: true
              },
              {
                type: "preproc_else",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_statement",
              named: true
            },
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "access_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "enumerator",
              named: true
            },
            {
              type: "field_declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "preproc_include",
        named: true,
        fields: {
          path: {
            multiple: false,
            required: true,
            types: [
              {
                type: "call_expression",
                named: true
              },
              {
                type: "identifier",
                named: true
              },
              {
                type: "string_literal",
                named: true
              },
              {
                type: "system_lib_string",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "preproc_params",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "pure_virtual_clause",
        named: true,
        fields: {}
      },
      {
        type: "qualified_identifier",
        named: true,
        fields: {
          name: {
            multiple: true,
            required: true,
            types: [
              {
                type: "dependent_name",
                named: true
              },
              {
                type: "destructor_name",
                named: true
              },
              {
                type: "field_identifier",
                named: true
              },
              {
                type: "identifier",
                named: true
              },
              {
                type: "operator_cast",
                named: true
              },
              {
                type: "operator_name",
                named: true
              },
              {
                type: "pointer_type_declarator",
                named: true
              },
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template",
                named: false
              },
              {
                type: "template_function",
                named: true
              },
              {
                type: "template_method",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          },
          scope: {
            multiple: false,
            required: false,
            types: [
              {
                type: "decltype",
                named: true
              },
              {
                type: "dependent_name",
                named: true
              },
              {
                type: "namespace_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "raw_string_literal",
        named: true,
        fields: {
          delimiter: {
            multiple: false,
            required: false,
            types: [
              {
                type: "raw_string_delimiter",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "raw_string_content",
              named: true
            },
            {
              type: "raw_string_delimiter",
              named: true
            }
          ]
        }
      },
      {
        type: "ref_qualifier",
        named: true,
        fields: {}
      },
      {
        type: "reference_declarator",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_declarator",
              named: true
            },
            {
              type: "_field_declarator",
              named: true
            },
            {
              type: "_type_declarator",
              named: true
            },
            {
              type: "variadic_declarator",
              named: true
            }
          ]
        }
      },
      {
        type: "requirement_seq",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "compound_requirement",
              named: true
            },
            {
              type: "simple_requirement",
              named: true
            },
            {
              type: "type_requirement",
              named: true
            }
          ]
        }
      },
      {
        type: "requires_clause",
        named: true,
        fields: {
          constraint: {
            multiple: true,
            required: true,
            types: [
              {
                type: "(",
                named: false
              },
              {
                type: ")",
                named: false
              },
              {
                type: "_expression",
                named: true
              },
              {
                type: "constraint_conjunction",
                named: true
              },
              {
                type: "constraint_disjunction",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "requires_expression",
        named: true,
        fields: {
          parameters: {
            multiple: false,
            required: false,
            types: [
              {
                type: "parameter_list",
                named: true
              }
            ]
          },
          requirements: {
            multiple: false,
            required: true,
            types: [
              {
                type: "requirement_seq",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "return_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "comma_expression",
              named: true
            },
            {
              type: "initializer_list",
              named: true
            }
          ]
        }
      },
      {
        type: "seh_except_clause",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          },
          filter: {
            multiple: false,
            required: true,
            types: [
              {
                type: "parenthesized_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "seh_finally_clause",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "seh_leave_statement",
        named: true,
        fields: {}
      },
      {
        type: "seh_try_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "seh_except_clause",
              named: true
            },
            {
              type: "seh_finally_clause",
              named: true
            }
          ]
        }
      },
      {
        type: "simple_requirement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "comma_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "sized_type_specifier",
        named: true,
        fields: {
          type: {
            multiple: false,
            required: false,
            types: [
              {
                type: "primitive_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "sizeof_expression",
        named: true,
        fields: {
          type: {
            multiple: false,
            required: false,
            types: [
              {
                type: "type_descriptor",
                named: true
              }
            ]
          },
          value: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "static_assert_declaration",
        named: true,
        fields: {
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          message: {
            multiple: false,
            required: false,
            types: [
              {
                type: "concatenated_string",
                named: true
              },
              {
                type: "raw_string_literal",
                named: true
              },
              {
                type: "string_literal",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "storage_class_specifier",
        named: true,
        fields: {}
      },
      {
        type: "string_literal",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "escape_sequence",
              named: true
            },
            {
              type: "string_content",
              named: true
            }
          ]
        }
      },
      {
        type: "struct_specifier",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: false,
            types: [
              {
                type: "field_declaration_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "base_class_clause",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "virtual_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "structured_binding_declarator",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "subscript_argument_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "initializer_list",
              named: true
            }
          ]
        }
      },
      {
        type: "subscript_designator",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "subscript_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          indices: {
            multiple: false,
            required: true,
            types: [
              {
                type: "subscript_argument_list",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "subscript_range_designator",
        named: true,
        fields: {
          end: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          start: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "switch_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "condition_clause",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "template_argument_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            },
            {
              type: "type_descriptor",
              named: true
            }
          ]
        }
      },
      {
        type: "template_declaration",
        named: true,
        fields: {
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "template_parameter_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "friend_declaration",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "requires_clause",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "template_function",
        named: true,
        fields: {
          arguments: {
            multiple: false,
            required: true,
            types: [
              {
                type: "template_argument_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "template_instantiation",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "template_method",
        named: true,
        fields: {
          arguments: {
            multiple: false,
            required: true,
            types: [
              {
                type: "template_argument_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "field_identifier",
                named: true
              },
              {
                type: "operator_name",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "template_parameter_list",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "optional_parameter_declaration",
              named: true
            },
            {
              type: "optional_type_parameter_declaration",
              named: true
            },
            {
              type: "parameter_declaration",
              named: true
            },
            {
              type: "template_template_parameter_declaration",
              named: true
            },
            {
              type: "type_parameter_declaration",
              named: true
            },
            {
              type: "variadic_parameter_declaration",
              named: true
            },
            {
              type: "variadic_type_parameter_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "template_template_parameter_declaration",
        named: true,
        fields: {
          parameters: {
            multiple: false,
            required: true,
            types: [
              {
                type: "template_parameter_list",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "optional_type_parameter_declaration",
              named: true
            },
            {
              type: "type_parameter_declaration",
              named: true
            },
            {
              type: "variadic_type_parameter_declaration",
              named: true
            }
          ]
        }
      },
      {
        type: "template_type",
        named: true,
        fields: {
          arguments: {
            multiple: false,
            required: true,
            types: [
              {
                type: "template_argument_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: true,
            types: [
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "throw_specifier",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "type_descriptor",
              named: true
            }
          ]
        }
      },
      {
        type: "throw_statement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "_expression",
              named: true
            }
          ]
        }
      },
      {
        type: "trailing_return_type",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "type_descriptor",
              named: true
            }
          ]
        }
      },
      {
        type: "translation_unit",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "_type_specifier",
              named: true
            },
            {
              type: "alias_declaration",
              named: true
            },
            {
              type: "attributed_statement",
              named: true
            },
            {
              type: "break_statement",
              named: true
            },
            {
              type: "case_statement",
              named: true
            },
            {
              type: "co_return_statement",
              named: true
            },
            {
              type: "co_yield_statement",
              named: true
            },
            {
              type: "compound_statement",
              named: true
            },
            {
              type: "concept_definition",
              named: true
            },
            {
              type: "continue_statement",
              named: true
            },
            {
              type: "declaration",
              named: true
            },
            {
              type: "do_statement",
              named: true
            },
            {
              type: "expression_statement",
              named: true
            },
            {
              type: "for_range_loop",
              named: true
            },
            {
              type: "for_statement",
              named: true
            },
            {
              type: "function_definition",
              named: true
            },
            {
              type: "goto_statement",
              named: true
            },
            {
              type: "if_statement",
              named: true
            },
            {
              type: "labeled_statement",
              named: true
            },
            {
              type: "linkage_specification",
              named: true
            },
            {
              type: "namespace_alias_definition",
              named: true
            },
            {
              type: "namespace_definition",
              named: true
            },
            {
              type: "preproc_call",
              named: true
            },
            {
              type: "preproc_def",
              named: true
            },
            {
              type: "preproc_function_def",
              named: true
            },
            {
              type: "preproc_if",
              named: true
            },
            {
              type: "preproc_ifdef",
              named: true
            },
            {
              type: "preproc_include",
              named: true
            },
            {
              type: "return_statement",
              named: true
            },
            {
              type: "static_assert_declaration",
              named: true
            },
            {
              type: "switch_statement",
              named: true
            },
            {
              type: "template_declaration",
              named: true
            },
            {
              type: "template_instantiation",
              named: true
            },
            {
              type: "throw_statement",
              named: true
            },
            {
              type: "try_statement",
              named: true
            },
            {
              type: "type_definition",
              named: true
            },
            {
              type: "using_declaration",
              named: true
            },
            {
              type: "while_statement",
              named: true
            }
          ]
        }
      },
      {
        type: "try_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "compound_statement",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "catch_clause",
              named: true
            },
            {
              type: "field_initializer_list",
              named: true
            }
          ]
        }
      },
      {
        type: "type_definition",
        named: true,
        fields: {
          declarator: {
            multiple: true,
            required: true,
            types: [
              {
                type: "_type_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "type_descriptor",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: false,
            types: [
              {
                type: "_abstract_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "type_qualifier",
              named: true
            }
          ]
        }
      },
      {
        type: "type_parameter_declaration",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "type_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "type_qualifier",
        named: true,
        fields: {}
      },
      {
        type: "type_requirement",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "qualified_identifier",
              named: true
            },
            {
              type: "template_type",
              named: true
            },
            {
              type: "type_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "unary_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              },
              {
                type: "preproc_defined",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "!",
                named: false
              },
              {
                type: "+",
                named: false
              },
              {
                type: "-",
                named: false
              },
              {
                type: "compl",
                named: false
              },
              {
                type: "not",
                named: false
              },
              {
                type: "~",
                named: false
              }
            ]
          }
        }
      },
      {
        type: "union_specifier",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: false,
            types: [
              {
                type: "field_declaration_list",
                named: true
              }
            ]
          },
          name: {
            multiple: false,
            required: false,
            types: [
              {
                type: "qualified_identifier",
                named: true
              },
              {
                type: "template_type",
                named: true
              },
              {
                type: "type_identifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "base_class_clause",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "virtual_specifier",
              named: true
            }
          ]
        }
      },
      {
        type: "update_expression",
        named: true,
        fields: {
          argument: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_expression",
                named: true
              }
            ]
          },
          operator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "++",
                named: false
              },
              {
                type: "--",
                named: false
              }
            ]
          }
        }
      },
      {
        type: "user_defined_literal",
        named: true,
        fields: {},
        children: {
          multiple: true,
          required: true,
          types: [
            {
              type: "char_literal",
              named: true
            },
            {
              type: "concatenated_string",
              named: true
            },
            {
              type: "literal_suffix",
              named: true
            },
            {
              type: "number_literal",
              named: true
            },
            {
              type: "raw_string_literal",
              named: true
            },
            {
              type: "string_literal",
              named: true
            }
          ]
        }
      },
      {
        type: "using_declaration",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: true,
          types: [
            {
              type: "identifier",
              named: true
            },
            {
              type: "qualified_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "variadic_declarator",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "variadic_parameter",
        named: true,
        fields: {}
      },
      {
        type: "variadic_parameter_declaration",
        named: true,
        fields: {
          declarator: {
            multiple: false,
            required: true,
            types: [
              {
                type: "reference_declarator",
                named: true
              },
              {
                type: "variadic_declarator",
                named: true
              }
            ]
          },
          type: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_type_specifier",
                named: true
              }
            ]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [
            {
              type: "alignas_specifier",
              named: true
            },
            {
              type: "attribute_declaration",
              named: true
            },
            {
              type: "attribute_specifier",
              named: true
            },
            {
              type: "ms_declspec_modifier",
              named: true
            },
            {
              type: "storage_class_specifier",
              named: true
            },
            {
              type: "type_qualifier",
              named: true
            },
            {
              type: "virtual",
              named: true
            }
          ]
        }
      },
      {
        type: "variadic_type_parameter_declaration",
        named: true,
        fields: {},
        children: {
          multiple: false,
          required: false,
          types: [
            {
              type: "type_identifier",
              named: true
            }
          ]
        }
      },
      {
        type: "virtual",
        named: true,
        fields: {}
      },
      {
        type: "virtual_specifier",
        named: true,
        fields: {}
      },
      {
        type: "while_statement",
        named: true,
        fields: {
          body: {
            multiple: false,
            required: true,
            types: [
              {
                type: "_statement",
                named: true
              }
            ]
          },
          condition: {
            multiple: false,
            required: true,
            types: [
              {
                type: "condition_clause",
                named: true
              }
            ]
          }
        }
      },
      {
        type: "\n",
        named: false
      },
      {
        type: "!",
        named: false
      },
      {
        type: "!=",
        named: false
      },
      {
        type: '"',
        named: false
      },
      {
        type: '""',
        named: false
      },
      {
        type: "#define",
        named: false
      },
      {
        type: "#elif",
        named: false
      },
      {
        type: "#elifdef",
        named: false
      },
      {
        type: "#elifndef",
        named: false
      },
      {
        type: "#else",
        named: false
      },
      {
        type: "#endif",
        named: false
      },
      {
        type: "#if",
        named: false
      },
      {
        type: "#ifdef",
        named: false
      },
      {
        type: "#ifndef",
        named: false
      },
      {
        type: "#include",
        named: false
      },
      {
        type: "%",
        named: false
      },
      {
        type: "%=",
        named: false
      },
      {
        type: "&",
        named: false
      },
      {
        type: "&&",
        named: false
      },
      {
        type: "&=",
        named: false
      },
      {
        type: "'",
        named: false
      },
      {
        type: "(",
        named: false
      },
      {
        type: "()",
        named: false
      },
      {
        type: ")",
        named: false
      },
      {
        type: "*",
        named: false
      },
      {
        type: "*=",
        named: false
      },
      {
        type: "+",
        named: false
      },
      {
        type: "++",
        named: false
      },
      {
        type: "+=",
        named: false
      },
      {
        type: ",",
        named: false
      },
      {
        type: "-",
        named: false
      },
      {
        type: "--",
        named: false
      },
      {
        type: "-=",
        named: false
      },
      {
        type: "->",
        named: false
      },
      {
        type: "->*",
        named: false
      },
      {
        type: ".",
        named: false
      },
      {
        type: ".*",
        named: false
      },
      {
        type: "...",
        named: false
      },
      {
        type: "/",
        named: false
      },
      {
        type: "/=",
        named: false
      },
      {
        type: "0",
        named: false
      },
      {
        type: ":",
        named: false
      },
      {
        type: "::",
        named: false
      },
      {
        type: ";",
        named: false
      },
      {
        type: "<",
        named: false
      },
      {
        type: "<<",
        named: false
      },
      {
        type: "<<=",
        named: false
      },
      {
        type: "<=",
        named: false
      },
      {
        type: "<=>",
        named: false
      },
      {
        type: "=",
        named: false
      },
      {
        type: "==",
        named: false
      },
      {
        type: ">",
        named: false
      },
      {
        type: ">=",
        named: false
      },
      {
        type: ">>",
        named: false
      },
      {
        type: ">>=",
        named: false
      },
      {
        type: "?",
        named: false
      },
      {
        type: 'L"',
        named: false
      },
      {
        type: "L'",
        named: false
      },
      {
        type: 'LR"',
        named: false
      },
      {
        type: "NULL",
        named: false
      },
      {
        type: 'R"',
        named: false
      },
      {
        type: 'U"',
        named: false
      },
      {
        type: "U'",
        named: false
      },
      {
        type: 'UR"',
        named: false
      },
      {
        type: "[",
        named: false
      },
      {
        type: "[[",
        named: false
      },
      {
        type: "[]",
        named: false
      },
      {
        type: "]",
        named: false
      },
      {
        type: "]]",
        named: false
      },
      {
        type: "^",
        named: false
      },
      {
        type: "^=",
        named: false
      },
      {
        type: "_Alignof",
        named: false
      },
      {
        type: "_Atomic",
        named: false
      },
      {
        type: "_Generic",
        named: false
      },
      {
        type: "_Noreturn",
        named: false
      },
      {
        type: "__alignof",
        named: false
      },
      {
        type: "__alignof__",
        named: false
      },
      {
        type: "__asm__",
        named: false
      },
      {
        type: "__attribute__",
        named: false
      },
      {
        type: "__based",
        named: false
      },
      {
        type: "__cdecl",
        named: false
      },
      {
        type: "__clrcall",
        named: false
      },
      {
        type: "__declspec",
        named: false
      },
      {
        type: "__except",
        named: false
      },
      {
        type: "__extension__",
        named: false
      },
      {
        type: "__fastcall",
        named: false
      },
      {
        type: "__finally",
        named: false
      },
      {
        type: "__forceinline",
        named: false
      },
      {
        type: "__inline",
        named: false
      },
      {
        type: "__inline__",
        named: false
      },
      {
        type: "__leave",
        named: false
      },
      {
        type: "__restrict__",
        named: false
      },
      {
        type: "__stdcall",
        named: false
      },
      {
        type: "__thiscall",
        named: false
      },
      {
        type: "__thread",
        named: false
      },
      {
        type: "__try",
        named: false
      },
      {
        type: "__unaligned",
        named: false
      },
      {
        type: "__vectorcall",
        named: false
      },
      {
        type: "_alignof",
        named: false
      },
      {
        type: "_unaligned",
        named: false
      },
      {
        type: "alignas",
        named: false
      },
      {
        type: "alignof",
        named: false
      },
      {
        type: "and",
        named: false
      },
      {
        type: "and_eq",
        named: false
      },
      {
        type: "asm",
        named: false
      },
      {
        type: "auto",
        named: true
      },
      {
        type: "bitand",
        named: false
      },
      {
        type: "bitor",
        named: false
      },
      {
        type: "break",
        named: false
      },
      {
        type: "case",
        named: false
      },
      {
        type: "catch",
        named: false
      },
      {
        type: "character",
        named: true
      },
      {
        type: "class",
        named: false
      },
      {
        type: "co_await",
        named: false
      },
      {
        type: "co_return",
        named: false
      },
      {
        type: "co_yield",
        named: false
      },
      {
        type: "comment",
        named: true
      },
      {
        type: "compl",
        named: false
      },
      {
        type: "concept",
        named: false
      },
      {
        type: "const",
        named: false
      },
      {
        type: "consteval",
        named: false
      },
      {
        type: "constexpr",
        named: false
      },
      {
        type: "constinit",
        named: false
      },
      {
        type: "continue",
        named: false
      },
      {
        type: "decltype",
        named: false
      },
      {
        type: "default",
        named: false
      },
      {
        type: "defined",
        named: false
      },
      {
        type: "delete",
        named: false
      },
      {
        type: "do",
        named: false
      },
      {
        type: "else",
        named: false
      },
      {
        type: "enum",
        named: false
      },
      {
        type: "escape_sequence",
        named: true
      },
      {
        type: "explicit",
        named: false
      },
      {
        type: "extern",
        named: false
      },
      {
        type: "false",
        named: true
      },
      {
        type: "field_identifier",
        named: true
      },
      {
        type: "final",
        named: false
      },
      {
        type: "for",
        named: false
      },
      {
        type: "friend",
        named: false
      },
      {
        type: "goto",
        named: false
      },
      {
        type: "identifier",
        named: true
      },
      {
        type: "if",
        named: false
      },
      {
        type: "inline",
        named: false
      },
      {
        type: "literal_suffix",
        named: true
      },
      {
        type: "long",
        named: false
      },
      {
        type: "ms_restrict_modifier",
        named: true
      },
      {
        type: "ms_signed_ptr_modifier",
        named: true
      },
      {
        type: "ms_unsigned_ptr_modifier",
        named: true
      },
      {
        type: "mutable",
        named: false
      },
      {
        type: "namespace",
        named: false
      },
      {
        type: "namespace_identifier",
        named: true
      },
      {
        type: "new",
        named: false
      },
      {
        type: "noexcept",
        named: false
      },
      {
        type: "noreturn",
        named: false
      },
      {
        type: "not",
        named: false
      },
      {
        type: "not_eq",
        named: false
      },
      {
        type: "nullptr",
        named: false
      },
      {
        type: "number_literal",
        named: true
      },
      {
        type: "offsetof",
        named: false
      },
      {
        type: "operator",
        named: false
      },
      {
        type: "or",
        named: false
      },
      {
        type: "or_eq",
        named: false
      },
      {
        type: "override",
        named: false
      },
      {
        type: "preproc_arg",
        named: true
      },
      {
        type: "preproc_directive",
        named: true
      },
      {
        type: "primitive_type",
        named: true
      },
      {
        type: "private",
        named: false
      },
      {
        type: "protected",
        named: false
      },
      {
        type: "public",
        named: false
      },
      {
        type: "raw_string_content",
        named: true
      },
      {
        type: "raw_string_delimiter",
        named: true
      },
      {
        type: "register",
        named: false
      },
      {
        type: "requires",
        named: false
      },
      {
        type: "restrict",
        named: false
      },
      {
        type: "return",
        named: false
      },
      {
        type: "short",
        named: false
      },
      {
        type: "signed",
        named: false
      },
      {
        type: "sizeof",
        named: false
      },
      {
        type: "statement_identifier",
        named: true
      },
      {
        type: "static",
        named: false
      },
      {
        type: "static_assert",
        named: false
      },
      {
        type: "string_content",
        named: true
      },
      {
        type: "struct",
        named: false
      },
      {
        type: "switch",
        named: false
      },
      {
        type: "system_lib_string",
        named: true
      },
      {
        type: "template",
        named: false
      },
      {
        type: "this",
        named: true
      },
      {
        type: "thread_local",
        named: false
      },
      {
        type: "throw",
        named: false
      },
      {
        type: "true",
        named: true
      },
      {
        type: "try",
        named: false
      },
      {
        type: "type_identifier",
        named: true
      },
      {
        type: "typedef",
        named: false
      },
      {
        type: "typename",
        named: false
      },
      {
        type: 'u"',
        named: false
      },
      {
        type: "u'",
        named: false
      },
      {
        type: 'u8"',
        named: false
      },
      {
        type: "u8'",
        named: false
      },
      {
        type: 'u8R"',
        named: false
      },
      {
        type: 'uR"',
        named: false
      },
      {
        type: "union",
        named: false
      },
      {
        type: "unsigned",
        named: false
      },
      {
        type: "using",
        named: false
      },
      {
        type: "virtual",
        named: false
      },
      {
        type: "volatile",
        named: false
      },
      {
        type: "while",
        named: false
      },
      {
        type: "xor",
        named: false
      },
      {
        type: "xor_eq",
        named: false
      },
      {
        type: "{",
        named: false
      },
      {
        type: "|",
        named: false
      },
      {
        type: "|=",
        named: false
      },
      {
        type: "||",
        named: false
      },
      {
        type: "}",
        named: false
      },
      {
        type: "~",
        named: false
      }
    ];
  }
});

// node_modules/tree-sitter-cpp/bindings/node/index.js
var require_node = __commonJS({
  "node_modules/tree-sitter-cpp/bindings/node/index.js"(exports2, module2) {
    var root = require("path").join(__dirname, "..", "..");
    module2.exports = require_node_gyp_build2()(root);
    try {
      module2.exports.nodeTypeInfo = require_node_types();
    } catch (_) {
    }
  }
});

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
var import_tree_sitter = __toESM(require_tree_sitter());
var import_tree_sitter_cpp = __toESM(require_node());
var import_console = require("console");
function getClassName(sourceCode, row, colum) {
  const parser = new import_tree_sitter.default();
  parser.setLanguage(import_tree_sitter_cpp.default);
  const tree = parser.parse(sourceCode);
  for (let i = 0; i < tree.rootNode.namedChildCount; i++) {
    let node = tree.rootNode.namedChildren[i];
    if (node.type == "class_specifier") {
      if (row > node.startIndex && row < node.endIndex) {
        let classChildren = node.namedChildren;
        classChildren.find((child, index) => {
          if (child.type == "type_identifier") {
            (0, import_console.log)(child.text);
            return child.text;
          }
        });
      }
    }
  }
  return "";
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
    const edit2 = {
      changes: {}
    };
    const lineNumber = range.start.line + 1;
    const pos = { line: lineNumber, character: 0 };
    const curText = document.lineAt(lineNumber - 1).text;
    const fullText = document.getText();
    let className2 = getClassName(fullText, range.start.line);
    const imp = curText.replace(/;$/, "{");
    edit2.changes[document.uri] = [
      coc.TextEdit.insert(pos, className2),
      coc.TextEdit.insert({ line: lineNumber + 1, character: 0 }, imp)
    ];
    const action = coc.CodeAction.create(
      "add definition",
      edit2,
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
