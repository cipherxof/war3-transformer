/** @noSelfInFile * */

declare type ObjectData = import('war3-objectdata').ObjectData;

declare interface CompiletimeContext {
  objectData: ObjectData;
  fourCC: (id: string) => number;
  log: (...any: any) => void;
}

/**
 * @param any Expression to be evaluated by Node.
 */
declare function compiletime(ctx: CompiletimeContext): object | string | number | boolean;
