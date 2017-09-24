var onebusaway = onebusaway || {};

onebusaway.jsonToMap = function (j) {
    return new Map(j);
};

onebusaway.getDepTime = function (predictedArrivalTime) {
    var departureTime = moment(predictedArrivalTime).locale('en-us'),
        now = moment();
    // console.log(departureTime);
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
  var c = 0;
  var deps = [];
  if (body.data.entry.arrivalsAndDepartures.length > 0) {
    body.next = body.data.entry.arrivalsAndDepartures[0];

    for(var i=0; i < body.data.entry.arrivalsAndDepartures.length; i++){
        if(c < 5){
            if(body.data.entry.arrivalsAndDepartures[i].routeShortName == "8"){
                if(onebusaway.getDepTime(body.data.entry.arrivalsAndDepartures[i].predictedArrivalTime).isBefore(moment('2016-01-01'))){
                    body.data.entry.arrivalsAndDepartures[i].arrivalTime = body.data.entry.arrivalsAndDepartures[i].scheduledArrivalTime;
                    body.data.entry.arrivalsAndDepartures[i].isNotPredicted = true;
                    console.log("predictedArrivalTime not available, using scheduled for: " + c);
                } else {
                    body.data.entry.arrivalsAndDepartures[i].arrivalTime = body.data.entry.arrivalsAndDepartures[i].predictedArrivalTime;
                    body.data.entry.arrivalsAndDepartures[i].isNotPredicted = false;
                }
                c++;
                deps.push(body.data.entry.arrivalsAndDepartures[i]);
            }
        }
    }
    body.upcoming = deps;
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
  for(var i=0; i < state.upcoming.length;i++){
    var scheduledArrivalMessage = '';
    if(state.upcoming[i].isNotPredicted){
        scheduledArrivalMessage = '*';
    }
    // console.log(state.upcoming[i]);
    var t = onebusaway.getDepTime(state.upcoming[i].arrivalTime);
    // console.log(t);
    rows.push(m('tr', [
      m('td', {'class': 'destination'}, state.upcoming[i].routeShortName),
      m('td.time', t.format('HH:mm') + scheduledArrivalMessage)
    ]));
  }
  var nextDepTime = onebusaway.getDepTime(state.upcoming[0].arrivalTime);
  if(nextDepTime.isBefore()){
    nextDepTime = onebusaway.getDepTime(state.upcoming[1].arrivalTime);
  }
  return [
    m('p.fade', 'Brandon\'s work route: line 8 '),
    m('h1', nextDepTime.format('HH:mm')),
    m('h2', nextDepTime.fromNow()),
    m('table', rows),
    m('p', {'class': 'fade updated-at'}, 'Sist oppdatert: ' +
      state.updatedAt)
  ];
};
