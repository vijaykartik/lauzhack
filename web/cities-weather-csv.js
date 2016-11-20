const fs = require('fs');
const cities = require('./cities-weather.json');
const _ = require('lodash');

var out = '';
_.forEach(cities, (c) => {
  out += c.id + ',' + c.city + ',' + c.station + '\n';
});
console.log(out);
