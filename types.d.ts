/** @noSelfInFile * */

interface CompiletimeContext {
  objectData: unknown;
  log: (...any: any) => void;
}

 /**
  * @param any Expression to be evaluated by Node.
  */
 declare function compiletime(ctx: CompiletimeContext): any;