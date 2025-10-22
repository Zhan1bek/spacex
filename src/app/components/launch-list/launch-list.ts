import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Launch } from '../../models/launch';
import { SpacexService } from '../../services/spacex';
import {
  Observable, Subject, BehaviorSubject, combineLatest, of,
} from 'rxjs';
import {
  debounceTime, distinctUntilChanged, startWith,
  map, catchError, shareReplay
} from 'rxjs/operators';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-launch-list',
  standalone: true,
  imports: [CommonModule, SearchBar, RouterLink],
  templateUrl: './launch-list.html',
  styleUrl: './launch-list.css'
})
export class LaunchList implements OnDestroy {
  private query$ = new Subject<string>();
  private successOnly$ = new BehaviorSubject<boolean>(false);

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
    );

    const search$ = this.query$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

    this.launches$ = combineLatest([this.allLaunches$, search$, this.successOnly$]).pipe(
      map(([list, q, successOnly]) => {
        const s = q.trim().toLowerCase();

        let out = s
          ? list.filter(l => l.name?.toLowerCase().includes(s))
          : list;

        if (successOnly) {
          out = out.filter(l => l.success === true);
        }
        return out;
      })
    );

    this.launches$.subscribe({ next: () => (this.loading = false) });
  }

  onQuery(value: string) {
    this.query$.next(value);
  }

  toggleSuccessOnly(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.successOnly$.next(checked);
  }

  ngOnDestroy() {
    this.query$.complete();
    this.successOnly$.complete();
  }
}
