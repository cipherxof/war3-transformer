import * as nodePath from "path";
import { createMatchPath } from "tsconfig-paths";
import * as utils from "tsutils";
import * as ts from "typescript";
import { loadObjectData, saveObjectData } from "./objectdata";
import * as compileTimeObjects from "war3-objectdata-th/dist/cjs";
import { stringToBase256 } from "mdx-m3-viewer-th/dist/cjs/common/typecast";

require.extensions[".ts"] = require.extensions[".js"];
require.extensions[".tsx"] = require.extensions[".js"];

let absoluteBaseUrl;
let compilerOptions;

function shouldAddCurrentWorkingDirectoryPath(
  baseUrl: ts.CompilerOptions["baseUrl"]
): boolean {
  if (!baseUrl) {
    return true;
  }
  const worksOnUnix = baseUrl[0] === "/";
  const worksOnWindows = new RegExp("^[A-Z]:/").test(baseUrl);
  return !(worksOnUnix || worksOnWindows);
}

function createObjectLiteral(
  object: any,
  context: ts.TransformationContext
): ts.ObjectLiteralExpression {
  
  const props = Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) =>
      context.factory.createPropertyAssignment(
        key,
        createExpression(object[key], context)
      )
    );
  return context.factory.createObjectLiteralExpression(props, true);
}

function createExpression(
  thing: any,
  context: ts.TransformationContext
): ts.Expression {
  if (thing === undefined) {
    return context.factory.createVoidZero();
  } else if (thing === null) {
    return context.factory.createNull();
  } else if (typeof thing === "boolean") {
    return thing ? ts.factory.createTrue() : ts.factory.createFalse();
  } else if (typeof thing === "number") {
    return context.factory.createNumericLiteral(String(thing));
  } else if (typeof thing === "string") {
    return context.factory.createStringLiteral(thing);
  } else if (Array.isArray(thing)) {
    return context.factory.createArrayLiteralExpression(
      thing.map((element) => createExpression(element, context)),
      true
    );
  } else if (typeof thing === "object") {
    return createObjectLiteral(thing, context);
  } else {
    throw new Error(
      `war3-transformer: Don't know how to turn a ${typeof thing} into an AST expression.`
    );
  }
}

interface TransformerOptions {
  mapDir: string;
  entryFile: string;
  outputDir: string;
}

export default function runTransformer(
  program: ts.Program,
  options: TransformerOptions
): ts.TransformerFactory<ts.Node> {
  const checker = program.getTypeChecker();
  const objectData = loadObjectData(options.mapDir);
  
  function processNode(
    node: ts.Node,
    file: ts.SourceFile,
    context: ts.TransformationContext
  ): ts.Node | undefined {
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

          const result = eval(`(${transpiledJs})`)({
            objectData,
            fourCC: stringToBase256,
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

  function processSourceFile(
    context: ts.TransformationContext,
    file: ts.SourceFile
  ) {
    function visitor(node: ts.Node): ts.Node {
      const newNode = processNode(node, file, context);

      if (newNode != undefined) {
        return newNode;
      }

      return ts.visitEachChild(node, visitor, context);
    }

    return ts.visitEachChild(file, visitor, context);
  }

  function processAndUpdateSourceFile(
    context: ts.TransformationContext,
    file: ts.SourceFile
  ) {
    const updatedNode = processSourceFile(context, file);

    return context.factory.updateSourceFile(
      file,
      updatedNode.statements,
      updatedNode.isDeclarationFile,
      updatedNode.referencedFiles,
      updatedNode.typeReferenceDirectives,
      updatedNode.hasNoDefaultLib
    );
  }

  return (context) => (node: ts.Node) => {
    compilerOptions = context.getCompilerOptions();

    absoluteBaseUrl = shouldAddCurrentWorkingDirectoryPath(
      compilerOptions.baseUrl
    )
      ? nodePath.join(process.cwd(), compilerOptions.baseUrl || ".")
      : compilerOptions.baseUrl || ".";

    try {
      if (ts.isBundle(node)) {
        const newFiles = node.sourceFiles.map((file) =>
          processAndUpdateSourceFile(context, file)
        );

        return context.factory.updateBundle(node, newFiles);
      } else if (ts.isSourceFile(node)) {
        const tsFile = processAndUpdateSourceFile(context, node);

        // If this is the entry file, and thus the last file to be processed, save modified object data.
        if (
          options.entryFile &&
          options.outputDir &&
          nodePath.relative(node.fileName, options.entryFile).length === 0
        ) {
          saveObjectData(objectData, options.outputDir);
        }

        return tsFile;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    return node;
  };
}
