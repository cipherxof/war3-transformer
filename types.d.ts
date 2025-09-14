/** @noSelfInFile * */

declare type ObjectData = import('war3-objectdata-th').ObjectData;

declare type ConstantsType = {
  abilities: typeof import('war3-objectdata-th').Abilities;
  buffs: typeof import('war3-objectdata-th').Buffs;
  destructables: typeof import('war3-objectdata-th').Destructables;
  doodads: typeof import('war3-objectdata-th').Doodads;
  items: typeof import('war3-objectdata-th').Items;
  units: typeof import('war3-objectdata-th').Units;
  upgrades: typeof import('war3-objectdata-th').Upgrades;
}

declare interface CompiletimeContext {
  objectData: ObjectData;
  fourCC: (id: string) => number;
  log: (...any: any) => void;
  constants: ConstantsType;
}

declare type CompiletimeReturnType = object | string | number | boolean | undefined | null | void;

declare type CompiletimeFunction<T extends CompiletimeReturnType> = (ctx: CompiletimeContext) => T

/**
 * Pass a function that will be run at compile time in Node environment.
 * The `compiletime()` function expression itself will be transformed into the result of the provided function.
 */
declare function compiletime<T extends CompiletimeReturnType>(fn: CompiletimeFunction<T>): T
