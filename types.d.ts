/** @noSelfInFile * */

declare type ObjectData = import('war3-objectdata').ObjectData;

declare interface CompiletimeContext {
  objectData: ObjectData;
  fourCC: (id: string) => number;
  log: (...any: any) => void;
}

declare type CompiletimeReturnType = object | string | number | boolean | undefined | null;

declare type CompiletimeFunction = (ctx: CompiletimeContext) => CompiletimeReturnType;
/**
 * @param fn Expression to be evaluated by Node.
 */
declare function compiletime(fn: CompiletimeFunction): CompiletimeReturnType;