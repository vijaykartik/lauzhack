import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {

  constructor(private http: Http) {}

  search(from: string, to: string, date: string): Observable<any[]> {
    return this.http
     .get(`https://api.willibelate.com/search/${from}/${to}/${date}`)
     .map((r: Response) => r.json() as any[]);
  }
  getStats(trainNumber: Number, station: string): Observable<any> {
    let out: Observable<any> = Observable.empty();

    var o1 = this.http
    .get(`https://api.willibelate.com/stats/${trainNumber}/${station}/numbers`)
    .map((r: Response) => {
      return {type: 'numbers', data: r.json()};
    });
    out = Observable.merge(out, o1);

    var o2 = this.http
    .get(`https://api.willibelate.com/stats/${trainNumber}/${station}/dayofweek`)
    .map((r: Response) => {
      return {type: 'dayofweek', data: r.json()};
    });
    out = Observable.merge(out, o2);

    var o3 = this.http
    .get(`https://api.willibelate.com/stats/${trainNumber}/${station}/2months`)
    .map((r: Response) => {
      return {type: '2months', data: r.json()};
    });
    out = Observable.merge(out, o3);

    return out;
  }
}
