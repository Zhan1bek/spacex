import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Launch} from '../../models/launch';
import {SpacexService} from '../../services/spacex';
import {
  Observable, Subject, combineLatest, of,
  debounceTime, distinctUntilChanged, startWith,
  map, catchError, shareReplay
} from 'rxjs';
import {SearchBar} from '../search-bar/search-bar';


@Component({
  selector: 'app-launch-list',
  standalone: true,
  imports: [CommonModule, SearchBar],
  templateUrl: './launch-list.html',
  styleUrl: './launch-list.css'
})
export class LaunchList implements OnDestroy {
  private query$ = new Subject<string>();
  private allLaunches$: Observable<Launch[]>;
  launches$!: Observable<Launch[]>;
  loading = true;
  error = '';


  constructor(private api: SpacexService) {
    this.allLaunches$ = this.api.getLaunches(120).pipe(
      shareReplay(1),
      catchError(() => {
        this.error = 'Failed to load launch';
        this.loading = false;
        return of([]);
      })
    )

    this.launches$ = combineLatest([
      this.allLaunches$,
      this.query$.pipe(
        startWith(''),
        debounceTime(700),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([list, q]) => {
        const s = q.trim().toLowerCase();
        if (!s) return list;
        return list.filter(l => l.name?.toLowerCase().includes(s));
      })
    );

    this.launches$.subscribe({ next: () => (this.loading = false) })
  }

  onQuery(value: string) {
    this.query$.next(value);
  }

  ngOnDestroy() {
    this.query$.complete();
  }

}
