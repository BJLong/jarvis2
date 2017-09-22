var onebusaway = onebusaway || {};

onebusaway.view = function (vnode) {
  if (Object.keys(vnode.attrs.data).length === 0) {
    return [
        m('p', 'Waiting for data'),
        m('h1', 'Some H1')
    ]
  }
  return m('pre', JSON.stringify(vnode.attrs.data, null, '  '));
};
