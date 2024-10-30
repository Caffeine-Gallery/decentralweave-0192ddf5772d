export const idlFactory = ({ IDL }) => {
  const Element = IDL.Record({
    'id' : IDL.Text,
    'styles' : IDL.Text,
    'type' : IDL.Text,
    'position' : IDL.Record({ 'x' : IDL.Nat, 'y' : IDL.Nat }),
  });
  const Design = IDL.Record({
    'history' : IDL.Vec(IDL.Text),
    'elements' : IDL.Vec(Element),
    'deviceView' : IDL.Text,
  });
  return IDL.Service({
    'getDesign' : IDL.Func([], [IDL.Opt(Design)], ['query']),
    'publishDesign' : IDL.Func([IDL.Vec(Element)], [], []),
    'saveDesign' : IDL.Func([Design], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
