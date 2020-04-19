import * as nodePath from "path";
import { createMatchPath } from "tsconfig-paths";
import * as utils from "tsutils";
import * as ts from "typescript";

require.extensions[".ts"] = require.extensions[".js"];
require.extensions[".tsx"] = require.extensions[".js"];

let absoluteBaseUrl;
let compilerOptions;
let matchPathFunc;

function getModuleSpecifierValue(specifier: ts.Expression) {
  return specifier.getText().substr(specifier.getLeadingTriviaWidth(), specifier.getWidth() - specifier.getLeadingTriviaWidth() * 2);
}

function isPathRelative(path: string) {
  return path.startsWith("./") || path.startsWith("../");
}

function shouldAddCurrentWorkingDirectoryPath(baseUrl: ts.CompilerOptions["baseUrl"]): boolean {
  if (!baseUrl) {
    return true;
  }
  const worksOnUnix = baseUrl[0] === "/";
  const worksOnWindows = new RegExp("^[A-Z]:/").test(baseUrl);
  return !(worksOnUnix || worksOnWindows);
};

function createObjectLiteral(object: any): ts.ObjectLiteralExpression {
  const props = Object.keys(object)
    .filter(key => object[key] !== undefined)
    .map(key => ts.createPropertyAssignment(key, createExpression(object[key])))
  return ts.createObjectLiteral(props, true)
}

function createExpression(thing: any): ts.Expression {
  if (thing === undefined) {
    return ts.createVoidZero();
  } else if (thing === null) {
    return ts.createNull();
  } else if (typeof thing === "boolean") {
    return ts.createLiteral(thing);
  } else if (typeof thing === "number") {
    return ts.createNumericLiteral(String(thing));
  } else if (typeof thing === "string") {
    return ts.createStringLiteral(thing);
  } else if (Array.isArray(thing)) {
    return ts.createArrayLiteral(thing.map(element => createExpression(element)), true);
  } else if (typeof thing === "object") {
    return createObjectLiteral(thing);
  } else {
    throw new Error(`war3-transformer: Don't know how to turn a ${thing} into an AST expression.`);
  }
}

export default function runTransformer(program: ts.Program): ts.TransformerFactory<ts.Node> {
  const checker = program.getTypeChecker();

  function processNode(node: ts.Node, file: ts.SourceFile): ts.Node | undefined {
    if (utils.isCallExpression(node)) {
      const signature = checker.getResolvedSignature(node);
      const decl = signature.declaration;

      if (!decl) return;

      if (decl.kind == ts.SyntaxKind.FunctionDeclaration) {
        const funcName = decl.name.escapedText;

        if (funcName === "compiletime") {
          const argument = node.arguments[0];
          const codeBlock = argument.getFullText();
          let transpiledJs = ts.transpile(codeBlock).trimRight();

          if (transpiledJs[transpiledJs.length - 1] === ";") {
            transpiledJs = transpiledJs.substr(0, transpiledJs.length - 1);
          }

          const result = eval(`(${transpiledJs})()`);

          if (typeof result === "object") {
            return createObjectLiteral(result);
          } else if (typeof result === "function" || result == null) {
            throw new Error(`compiletime only supports primitive, non-null values`);
          }

          return ts.createLiteral(result);
        }
      }
    } else if (utils.isImportDeclaration(node)) {

      if (!node.moduleSpecifier || !node.moduleSpecifier.getSourceFile()) {
        return node;
      }

      const sourceFilePath = nodePath.dirname(file.fileName);
      const specifierValue = getModuleSpecifierValue(node.moduleSpecifier);
      const matchedPath = matchPathFunc(specifierValue);

      if (!matchedPath) {
        return node;
      }

      const newNode = ts.getMutableClone(node);
      const replacePath = nodePath.relative(sourceFilePath, matchedPath).replace(/\\/g, "/");
      newNode.moduleSpecifier = ts.createLiteral(isPathRelative(replacePath) ? replacePath : `./${replacePath}`);

      return newNode;
    }
    return;
  }

  function processSourceFile(context: ts.TransformationContext, file: ts.SourceFile) {
    function visitor(node: ts.Node): ts.Node {
      const newNode = processNode(node, file);

      if (newNode != undefined) {
        return newNode;
      }

      return ts.visitEachChild(node, visitor, context);
    }

    return ts.visitEachChild(file, visitor, context);
  }

  function processAndUpdateSourceFile(context: ts.TransformationContext, file: ts.SourceFile) {
    const updatedNode = processSourceFile(context, file);

    return ts.updateSourceFileNode(
      file,
      updatedNode.statements,
      updatedNode.isDeclarationFile,
      updatedNode.referencedFiles,
      updatedNode.typeReferenceDirectives,
      updatedNode.hasNoDefaultLib
    );
  }

  return context => (node: ts.Node) => {
    compilerOptions = context.getCompilerOptions();

    absoluteBaseUrl = shouldAddCurrentWorkingDirectoryPath(compilerOptions.baseUrl)
      ? nodePath.join(process.cwd(), compilerOptions.baseUrl || ".")
      : compilerOptions.baseUrl || ".";

    matchPathFunc = createMatchPath(absoluteBaseUrl, compilerOptions.paths || {});

    try {
      if (ts.isBundle(node)) {
        const newFiles = node.sourceFiles.map(file => processAndUpdateSourceFile(context, file));

        return ts.updateBundle(node, newFiles);
      } else if (ts.isSourceFile(node)) {
        return processAndUpdateSourceFile(context, node);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    return node;
  }
}