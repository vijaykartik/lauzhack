const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');

var citiesWeather = require('./cities-weather.json');
var citiesDayWeather = {};

fs.readFile('./DailyPrecipitation.csv', 'utf-8', function (err,data) {
  var lines = data.split('\r');
  _.forEach(lines, (l) => {
    l = l.split(',');
    if (l.length <= 3) {
      return;
    }
    console.log(l[0]);
    var weather = {
      Geneva: parseInt(l[1]),
      Payerne: parseInt(l[2]),
      Sion: parseInt(l[3]),
      Zurich: parseInt(l[4]),
      Basel: parseInt(l[5])
    };
    citiesDayWeather[l[0]] = {};

    _.forEach(citiesWeather, (c) => {
      citiesDayWeather[l[0]][c.id] = weather[c.station];
    });
  });

  fs.writeFile("./cities-day-weather.json", JSON.stringify(citiesDayWeather));
});
