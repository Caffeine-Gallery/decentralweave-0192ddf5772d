import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Element { 'content' : string, 'type' : string }
export interface MediaItem { 'data' : Uint8Array | number[], 'name' : string }
export type Page = Array<Element>;
export interface SharedSiteData {
  'siteData' : Array<[string, Page]>,
  'pages' : Array<string>,
}
export interface _SERVICE {
  'getMediaLibrary' : ActorMethod<[], Array<MediaItem>>,
  'getSiteData' : ActorMethod<[], [] | [SharedSiteData]>,
  'publishSite' : ActorMethod<[SharedSiteData], undefined>,
  'uploadMedia' : ActorMethod<[string, Uint8Array | number[]], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
