import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Design {
  'history' : Array<string>,
  'elements' : Array<Element>,
  'deviceView' : string,
}
export interface Element {
  'id' : string,
  'styles' : string,
  'type' : string,
  'position' : { 'x' : bigint, 'y' : bigint },
}
export interface _SERVICE {
  'getDesign' : ActorMethod<[], [] | [Design]>,
  'publishDesign' : ActorMethod<[Array<Element>], undefined>,
  'saveDesign' : ActorMethod<[Design], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
