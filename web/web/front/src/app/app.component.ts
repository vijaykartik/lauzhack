import { Component } from '@angular/core';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { cities } from './cities';
import * as levenshtein from 'fast-levenshtein';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works 2!';
  results = [];

  from: string = 'Lausanne';
  to: string = 'Bern';
  date: string = '2016-11-21 14:00';
  cities: any[] = [];

  query: boolean = false;

  constructor(private apiService: ApiService) {
    _.forEach(cities, (c) => {
      this.cities.push({o: c, d: _.deburr(c)});
    })
  }

  ceil(n) {
    return Math.ceil(n);
  }
  stri(n) {
    return "" + n;
  }

  submit() {
    // var min = 999;
    // var closest = null;
    // var dfrom = _.deburr(this.from);
    // _.forEach(this.cities, (c) => {
    //   var d = levenshtein.get(c.d, dfrom);
    //   if (d <= min) {
    //     min = d;
    //     closest = c.o;
    //   }
    // });
    // this.from = closest;
    this.query = true;
    this.apiService.search(this.from, this.to, this.date).subscribe((data) => {
      this.results = data;
      _.forEach(data, (d) => {
        d.showStats = false;
        var dd = new Date(d.deptime_expected);
        d.departureTime = dd.getHours() + ':' + dd.getMinutes();
        var ad = new Date(d.arrtime_expected);
        d.arrivalTime = ad.getHours() + ':' + ad.getMinutes();
        d.trainNumber = d.routenum;
        d.stats = {};
        this.apiService.getStats(d.trainNumber, d.toplace.name).subscribe((stats) => {
          d.stats[stats.type] = stats.data;
        });
      });
      this.query = false;
    });
  }
}
