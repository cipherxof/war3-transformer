"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodePath = require("path");
var utils = require("tsutils");
var ts = require("typescript");
var objectdata_1 = require("./objectdata");
var compileTimeObjects = require("war3-objectdata-th/dist/cjs");
var typecast_1 = require("mdx-m3-viewer-th/dist/cjs/common/typecast");
require.extensions[".ts"] = require.extensions[".js"];
require.extensions[".tsx"] = require.extensions[".js"];
var absoluteBaseUrl;
var compilerOptions;
function shouldAddCurrentWorkingDirectoryPath(baseUrl) {
    if (!baseUrl) {
        return true;
    }
    var worksOnUnix = baseUrl[0] === "/";
    var worksOnWindows = new RegExp("^[A-Z]:/").test(baseUrl);
    return !(worksOnUnix || worksOnWindows);
}
function createObjectLiteral(object, context) {
    var props = Object.keys(object)
        .filter(function (key) { return object[key] !== undefined; })
        .map(function (key) {
        return context.factory.createPropertyAssignment(key, createExpression(object[key], context));
    });
    return context.factory.createObjectLiteralExpression(props, true);
}
function createExpression(thing, context) {
    if (thing === undefined) {
        return context.factory.createVoidZero();
    }
    else if (thing === null) {
        return context.factory.createNull();
    }
    else if (typeof thing === "boolean") {
        return thing ? ts.factory.createTrue() : ts.factory.createFalse();
    }
    else if (typeof thing === "number") {
        return context.factory.createNumericLiteral(String(thing));
    }
    else if (typeof thing === "string") {
        return context.factory.createStringLiteral(thing);
    }
    else if (Array.isArray(thing)) {
        return context.factory.createArrayLiteralExpression(thing.map(function (element) { return createExpression(element, context); }), true);
    }
    else if (typeof thing === "object") {
        return createObjectLiteral(thing, context);
    }
    else {
        throw new Error("war3-transformer: Don't know how to turn a ".concat(typeof thing, " into an AST expression."));
    }
}
function runTransformer(program, options) {
    var checker = program.getTypeChecker();
    var objectData = (0, objectdata_1.loadObjectData)(options.mapDir);
    function processNode(node, file, context) {
        if (utils.isCallExpression(node)) {
            var signature = checker.getResolvedSignature(node);
            var decl = signature.declaration;
            if (!decl)
                return;
            if (decl.kind == ts.SyntaxKind.FunctionDeclaration) {
                var funcName = decl.name.escapedText;
                if (funcName === "compiletime") {
                    var argument = node.arguments[0];
                    var codeBlock = argument.getFullText();
                    var transpiledJs = ts.transpile(codeBlock).trimRight();
                    if (transpiledJs[transpiledJs.length - 1] === ";") {
                        transpiledJs = transpiledJs.substr(0, transpiledJs.length - 1);
                    }
                    var result = eval("(".concat(transpiledJs, ")"))({
                        objectData: objectData,
                        fourCC: typecast_1.stringToBase256,
                        log: console.log,
                        constants: {
                            abilities: compileTimeObjects.Abilities,
                            buffs: compileTimeObjects.Buffs,
                            destructables: compileTimeObjects.Destructables,
                            doodads: compileTimeObjects.Doodads,
                            items: compileTimeObjects.Items,
                            units: compileTimeObjects.Units,
                            upgrades: compileTimeObjects.Upgrades
                        }
                    });
                    return createExpression(result, context);
                }
            }
        }
        return;
    }
    function processSourceFile(context, file) {
        function visitor(node) {
            var newNode = processNode(node, file, context);
            if (newNode != undefined) {
                return newNode;
            }
            return ts.visitEachChild(node, visitor, context);
        }
        return ts.visitEachChild(file, visitor, context);
    }
    function processAndUpdateSourceFile(context, file) {
        var updatedNode = processSourceFile(context, file);
        return context.factory.updateSourceFile(file, updatedNode.statements, updatedNode.isDeclarationFile, updatedNode.referencedFiles, updatedNode.typeReferenceDirectives, updatedNode.hasNoDefaultLib);
    }
    return function (context) { return function (node) {
        compilerOptions = context.getCompilerOptions();
        absoluteBaseUrl = shouldAddCurrentWorkingDirectoryPath(compilerOptions.baseUrl)
            ? nodePath.join(process.cwd(), compilerOptions.baseUrl || ".")
            : compilerOptions.baseUrl || ".";
        try {
            if (ts.isBundle(node)) {
                var newFiles = node.sourceFiles.map(function (file) {
                    return processAndUpdateSourceFile(context, file);
                });
                return context.factory.updateBundle(node, newFiles);
            }
            else if (ts.isSourceFile(node)) {
                var tsFile = processAndUpdateSourceFile(context, node);
                // If this is the entry file, and thus the last file to be processed, save modified object data.
                if (options.entryFile &&
                    options.outputDir &&
                    nodePath.relative(node.fileName, options.entryFile).length === 0) {
                    (0, objectdata_1.saveObjectData)(objectData, options.outputDir);
                }
                return tsFile;
            }
        }
        catch (e) {
            console.error(e);
            throw e;
        }
        return node;
    }; };
}
exports.default = runTransformer;
