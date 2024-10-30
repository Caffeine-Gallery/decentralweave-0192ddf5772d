import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
  type MediaItem = {
    name: Text;
    data: Blob;
  };

  type Element = {
    type_: Text;
    content: Text;
  };

  type Page = [Element];

  type SharedSiteData = {
    siteData: [(Text, Page)];
    pages: [Text];
  };

  stable var mediaEntries : [(Text, MediaItem)] = [];
  var mediaLibrary = HashMap.fromIter<Text, MediaItem>(mediaEntries.vals(), 10, Text.equal, Text.hash);

  stable var siteDataEntries : [(Text, Page)] = [];
  var siteData = HashMap.fromIter<Text, Page>(siteDataEntries.vals(), 10, Text.equal, Text.hash);

  stable var pages : [Text] = ["home"];

  public func uploadMedia(name: Text, data: Blob) : async () {
    let mediaItem : MediaItem = {
      name = name;
      data = data;
    };
    mediaLibrary.put(name, mediaItem);
  };

  public query func getMediaLibrary() : async [MediaItem] {
    Iter.toArray(mediaLibrary.vals())
  };

  public func publishSite(newSiteData: SharedSiteData) : async () {
    siteData := HashMap.fromIter<Text, Page>(newSiteData.siteData.vals(), 10, Text.equal, Text.hash);
    pages := newSiteData.pages;
  };

  public query func getSiteData() : async ?SharedSiteData {
    ?{
      siteData = Iter.toArray(siteData.entries());
      pages = pages;
    }
  };

  system func preupgrade() {
    mediaEntries := Iter.toArray(mediaLibrary.entries());
    siteDataEntries := Iter.toArray(siteData.entries());
  };

  system func postupgrade() {
    mediaLibrary := HashMap.fromIter<Text, MediaItem>(mediaEntries.vals(), 10, Text.equal, Text.hash);
    siteData := HashMap.fromIter<Text, Page>(siteDataEntries.vals(), 10, Text.equal, Text.hash);
  };
}
