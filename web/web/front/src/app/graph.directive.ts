import { Directive, ElementRef, Renderer, Input } from '@angular/core';
import 'Rickshaw';
import * as _ from 'lodash';

@Directive({
  selector: '[appGraph]'
})
export class GraphDirective {
  private v;
  private el;

  @Input() set data(d: any[]) {
    var time = new Rickshaw.Fixtures.Time();
    var data = [];
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (w < 400) {
      w = w - 2*30
    } else {
      w = 520 - 2*30;
    }
    var conf = {
      element: this.el.nativeElement,
      width: w,
      height: 130,
      min: -3,
      series: [{
        color: 'steelblue',
        data: data
      }]
    };

    if (d.length == 7) { // day of week
      console.log(d);
      var sunday = {dayofweek: 7, delay: 0};
      _.forEach(d, (dd) => {
        if (dd.dayofweek == 1) {
          sunday = dd;
          return;
        }
        data.push({
          x: dd.dayofweek-1,
          y: dd.delay/60
        });
      });
      data.push({
        x: 7,
        y: sunday.delay/60
      });
    } else {
      _.forEach(d, (dd) => {
        var delay = dd.delay.split(':');
        var delay2 = parseInt(delay[0])*60 + parseInt(delay[1]);
        if (dd.delay[0] == '-') {
          delay2 *= -1;
        }
        data.push({
          x: (new Date(dd.date)).getTime()/1000,
          y: delay2
        });
      });
    }

    var graph = new Rickshaw.Graph(conf);

    var xAxis;
    if (d.length == 7) {
      xAxis = new Rickshaw.Graph.Axis.X({
        graph: graph
      });
    } else {
      var timeUnit = time.unit('month');
      xAxis = new Rickshaw.Graph.Axis.Time({
        graph: graph,
        timeUnit: timeUnit
      });
    }

    xAxis.render();

    // var yAxis = new Rickshaw.Graph.Axis.Y({
    //   graph: graph
    // });
    // yAxis.render();

    var daysweek = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
      graph: graph,
      xFormatter: function(x) {
        if (x >= 1 && x <= 7) {
          return daysweek[x];
        } else {
          x = new Date(x*1000);
          return x.getDate() + '/' + (x.getUTCMonth()+1);
        }
      },
      formatter: function(series, x, y) {
        var delayi;
        if (y > 0) {
          var min = Math.floor(y);
          var secs = Math.floor(y*60) % 60;
          if (secs > 0) {
            delayi = min + "min" + secs + " late";
          } else {
            delayi = min + " min late";
          }
        } else if (y == 0) {
          delayi = "On time";
        } else {
          y = (-1)*y;
          var min = Math.floor(y);
          var secs = Math.floor(y*60) % 60;
          if (secs > 0) {
            delayi = min + "min" + secs + " early";
          } else {
            delayi = min + " min early";
          }
        }
    		// var date = '<span class="date">' + new Date(x * 1000).toUTCString() + '</span>';
    		// var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
    		var content = delayi;
    		return content;
    	}
    });

    graph.render();
  }

  constructor(renderer: Renderer, el: ElementRef) {
    this.el = el;
  }
}
