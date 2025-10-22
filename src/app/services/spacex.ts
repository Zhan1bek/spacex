import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Launch} from '../models/launch';

@Injectable({
  providedIn: 'root'
})
export class SpacexService {
  private base = 'https://api.spacexdata.com/v5';

  constructor(private http: HttpClient) {}

  getLaunches(limit = 30) : Observable<Launch[]> {
    return this.http.get<Launch[]>(`${this.base}/launches`)
    .pipe(
      map(launches => launches.slice(-limit).reverse())
    );

  }
  getLaunch(id: string): Observable<Launch> {
    return this.http.get<Launch>(`${this.base}/launches/${id}`);
  }


}
