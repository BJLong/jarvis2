var onebusaway = onebusaway || {};

onebusaway.parseState = function (data) {
  var body = data;

  body.entry.arrivalsAndDepartures.forEach(function (d) {
    var departureTime = moment(d.predictedArrivalTime).locale('en-us'),
        now = moment();
    if (departureTime.isBefore(now)) {
    } else {
        d.departureTime = departureTime;
    }
  });

  if (body.departures.length > 0) {
    body.next = body.departures[0];
    body.upcoming = {
        'line': body.departures.routeShortName
    }
    // body.upcoming = body.departures.slice(1, 5);
  } else {
    body.next = null;
    body.upcoming = [];
  }
  return body;
};

onebusaway.view = function (vnode) {
  if (Object.keys(vnode.attrs.data).length === 0) {
    return m('p', 'Waiting for data');
  }
  var state = onebusaway.parseState(vnode.attrs.data);
  var rows = state.upcoming.map(function (departure) {
    return m('tr', [
      m('td', {'class': 'destination'}, departure.line),
      m('td.time', departure.departureTime.format('HH:mm'))
    ]);
  });
  return [
    m('p.fade', 'Bus ' + state.next.line + ' til ' +
      state.next.destination),
    m('h1', state.next.departureTime.format('HH:mm')),
    m('h2', state.next.departureTime.fromNow()),
    m('table', rows),
    m('p', {'class': 'fade updated-at'}, 'Sist oppdatert: ' +
      state.updatedAt)
  ];
};
