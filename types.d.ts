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

declare type CompiletimeReturnType = object | string | number | boolean | undefined | null;

/**
 * Define a function that will be run on compile time in Node environment.
 * It will also return any value that the function defined return
 *
 * @returns string | number | boolean | object | undefined | null
 * @note Any other return type is considered never
 */
declare function compiletime<T>(func: T): T extends (ctx: CompiletimeContext) => infer T ? (T extends () => any ? never : (T extends CompiletimeReturnType ? T : never)) : never;

