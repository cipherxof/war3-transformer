/** @noSelfInFile * */

declare type ObjectData = import('war3-objectdata-th').ObjectData;

declare type ConstantsType = {
  abilities: any;
  buffs: any;
  destructables: any;
  doodads: any;
  items: any;
  units: any;
  upgrades: any;
}

declare interface CompiletimeContext {
  objectData: ObjectData;
  fourCC: (id: string) => number;
  log: (...any: any) => void;
  constants: ConstantsType;
}

declare type CompiletimeReturnType = object | string | number | boolean | undefined | null | void;

declare type CompiletimeFunction = (ctx: CompiletimeContext) => CompiletimeReturnType;
/**
 * @param fn Expression to be evaluated by Node.
 */
declare function compiletime(fn: CompiletimeFunction): CompiletimeReturnType;