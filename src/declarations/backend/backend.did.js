export const idlFactory = ({ IDL }) => {
  const MediaItem = IDL.Record({
    'data' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
  });
  const Element = IDL.Record({ 'content' : IDL.Text, 'type' : IDL.Text });
  const Page = IDL.Vec(Element);
  const SharedSiteData = IDL.Record({
    'siteData' : IDL.Vec(IDL.Tuple(IDL.Text, Page)),
    'pages' : IDL.Vec(IDL.Text),
  });
  return IDL.Service({
    'getMediaLibrary' : IDL.Func([], [IDL.Vec(MediaItem)], ['query']),
    'getSiteData' : IDL.Func([], [IDL.Opt(SharedSiteData)], ['query']),
    'publishSite' : IDL.Func([SharedSiteData], [], []),
    'uploadMedia' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
