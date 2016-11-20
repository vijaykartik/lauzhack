const key = 'AIzaSyCu814g7ytaN9dyYIgNHQ2bb7RX6KFN-_o';
const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');
const request = require('request-promise');

var final = require('./cities-weather.json');

var stations = ['Geneva', 'Basel', 'Zurich', 'Sion', 'Payerne'];
var reqs = [];
_.forEach(stations, (s) => {
  reqs.push(request.get({json: true, url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + s + '&key=' + key}));
});
Promise.all(reqs).then((positions) => {
  _.forEach(positions, (p, i) => {
    stations[i] = {
      name: stations[i],
      pos: p.results[0].geometry.location
    };
  });
  console.log(stations);

  var j = 0;
  fs.readFile('./cities.csv', 'utf-8', function (err,data) {
    var lines = data.split('\r');
    var rr = [];
    lines.splice(0, 1);
    _.forEach(lines, (l) => {
      j++;
      l = l.split(',');
      if (final[l[0]]) {
        console.log('skip');
        return;
      }
      var city = decodeURIComponent(escape(l[1]));
      console.log(city);
      r = request.get({json: true, url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(city) + '&key=' + key}).then((c) => {
        if (c.results.length == 0) {
          console.log('No result for ', city);
          return;
        }
        var coords = c.results[0].geometry.location;
        var closest;
        var min = 9999999999;
        _.forEach(stations, (s) => {
          var d = Math.pow(coords.lat - s.pos.lat, 2) + Math.pow(coords.lng - s.pos.lng, 2);
          if (d <= min) {
            min = d;
            closest = s;
          }
        });
        final[l[0]] = {id: l[0], city: city, station: closest.name};
      }).catch((e) => {
        console.log("Error with", city, e);
        return Promise.resolve();
      });
      rr.push(r);
    });
    Promise.all(rr).then(() => {
      // console.log(final);
      fs.writeFile("./cities-weather.json", JSON.stringify(final));
    });
  });
});
