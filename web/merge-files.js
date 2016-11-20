const dataFolder = './data/';
const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');

var n = {
  arrivale: 14,
  arrivalr: 15,
  departuree: 17,
  departurer: 18,
};

fs.readdir(dataFolder, (err, files) => {
  files.forEach(file => {
    if (!file.match(/csv$/)) {
      return;
    }

    fs.readFile(dataFolder + file, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var lines = data.split('\r\n');
      console.log(file, lines.length);
      var newdata = '';
      for (var i = 1; i < lines.length; i++) {
        var line = lines[i];
        var c = line.split(';');

        if ((!c[n.departurer] || !c[n.departuree]) && (!c[n.arrivale] || !c[n.arrivalr])) {
          continue;
        }

        var day = moment(c[0] + ' 00:00', 'DD.MM.YYYY HH:mm');

        if (c[n.arrivalr] && c[n.arrivale]) {
          var arrivale = moment(c[n.arrivale], 'DD.MM.YYYY HH:mm');
          var arrivalr = moment(c[n.arrivalr], 'DD.MM.YYYY HH:mm');
          var arrivalDelay = arrivalr.diff(arrivale)/1000/60;
          c.push(arrivalDelay);
        } else {
          c.push(null);
        }

        if (c[n.departurer] && c[n.departuree]) {
          var departuree = moment(c[n.departuree], 'DD.MM.YYYY HH:mm');
          var departurer = moment(c[n.departurer], 'DD.MM.YYYY HH:mm');
          var departureDelay = departurer.diff(departuree)/1000/60;
          c.push(departureDelay);
        } else {
          c.push(null);
        }

        if (c[n.departuree]) {
          var s = moment(c[n.departuree], 'DD.MM.YYYY HH:mm');
          c[n.departuree] = s.diff(day)/1000/60;
        }
        if (c[n.arrivale]) {
          var s = moment(c[n.arrivale], 'DD.MM.YYYY HH:mm');
          c[n.arrivale] = s.diff(day)/1000/60;
        }

        c.splice(n.departurer, 1);
        c.splice(n.arrivalr, 1);

        c.splice(17, 1);
        c.splice(15, 1);
        c.splice(8, 3);
        c.splice(1, 5);

        var dayOfWeek = parseInt(moment(c[0], 'DD.MM.YYYY').format('d'));
        c.push(dayOfWeek);
        c.splice(0, 1);

        // Let's focus on arrival
        if (c[8] === null) {
          continue;
        }

        c.splice(0, 0, c[8]);
        c.splice(10, 1);
        c.splice(9, 1);
        c.splice(8, 1);
        c.splice(3, 1);

        _.forEach([1, 2, 3, 4], (j) => {
          c[j] = JSON.stringify(c[j]);
        });

        newdata += c.join(';') + '\n';
        // console.log(c.join(';'));
      }
      fs.appendFileSync('./data.csv', newdata);
    });
  });
})
