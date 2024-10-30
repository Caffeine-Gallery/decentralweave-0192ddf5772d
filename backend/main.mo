import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
  type Element = {
    id: Text;
    type_: Text;
    position: { x: Nat; y: Nat };
    styles: Text;
  };

  type Design = {
    elements: [Element];
    history: [Text];
    deviceView: Text;
  };

  stable var designEntries : [(Text, Design)] = [];
  var designs = HashMap.fromIter<Text, Design>(designEntries.vals(), 10, Text.equal, Text.hash);

  public func saveDesign(design: Design) : async () {
    designs.put("current", design);
  };

  public query func getDesign() : async ?Design {
    designs.get("current")
  };

  public func publishDesign(elements: [Element]) : async () {
    // Implement publishing logic here
    // For now, we'll just save it as a published design
    let publishedDesign : Design = {
      elements = elements;
      history = [];
      deviceView = "desktop";
    };
    designs.put("published", publishedDesign);
  };

  system func preupgrade() {
    designEntries := Iter.toArray(designs.entries());
  };

  system func postupgrade() {
    designs := HashMap.fromIter<Text, Design>(designEntries.vals(), 10, Text.equal, Text.hash);
  };
}
