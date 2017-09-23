var onebusaway = onebusaway || {};

onebusaway.jsonToMap = function (j) {
    return new Map(j);
};

onebusaway.getDepTime = function (predictedArrivalTime) {
    var departureTime = moment(predictedArrivalTime).locale('en-us'),
        now = moment();
    console.log(departureTime);
    // if (departureTime.isBefore(now)) {
    // } else {
        // d.departureTime = departureTime;
    // }
    return departureTime;
};

onebusaway.parseState = function (data) {
  var body = data;
  // console.log(data);

  body.data.entry.arrivalsAndDepartures.forEach(function (d) {

    var departureTime = moment(d.predictedArrivalTime).locale('en-us'),
        now = moment();
    // console.log(departureTime);
    if (departureTime.isBefore(now)) {
    } else {
        d.departureTime = departureTime;
    }
  });

  if (body.data.entry.arrivalsAndDepartures.length > 0) {
    body.next = body.data.entry.arrivalsAndDepartures[0];
    // var json_data = '{"line": ' + body.data.entry.arrivalsAndDepartures[0].routeShortName + '}';
    // var json_obj = JSON.parse(json_data);
    console.log(body.data.entry.arrivalsAndDepartures.slice(1, 5));
    // body.upcoming = onebusaway.jsonToMap(json_obj.entries());
    body.upcoming = body.data.entry.arrivalsAndDepartures.slice(1, 5);
    // body.upcoming = new Map([['line', body.data.entry.arrivalsAndDepartures[0].routeShortName]]);
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
  var rows = [];
  // for(var dep in state.upcoming.values()){
  for(var i=0; i < state.upcoming.length;i++){
    console.log(state.upcoming[i]);
    var t = onebusaway.getDepTime(state.upcoming[i].predictedArrivalTime);
    console.log(t);
    rows.push(m('tr', [
      m('td', {'class': 'destination'}, state.upcoming[i].routeShortName),
      m('td.time', t.format('HH:mm'))
    ]));
  }
  // var rows = state.upcoming.map(function (departure) {
  //   return m('tr', [
  //     m('td', {'class': 'destination'}, departure.line),
  //     m('td.time', departure.departureTime.format('HH:mm'))
  //   ]);
  // });
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
