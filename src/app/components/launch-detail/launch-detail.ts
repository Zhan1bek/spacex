import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SpacexService } from '../../services/spacex';
import { switchMap, of, forkJoin, catchError } from 'rxjs';

@Component({
  selector: 'app-launch-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './launch-detail.html',
  styleUrl: './launch-detail.css'
})
export class LaunchDetail {
  vm: any = null;
  loading = true;
  error = '';

  constructor(route: ActivatedRoute, api: SpacexService) {
    route.paramMap.pipe(
      // 1) тянем сам launch; если упало — возвращаем null и не валимся
      switchMap(params => {
        const id = params.get('id')!;
        return api.getLaunch(id).pipe(
          catchError(() => of(null))
        );
      }),
      // 2) параллельно (и безопасно) тянем rocket/launchpad
      switchMap(launch => {
        if (!launch) {
          // не нашли сам запуск — покажем ошибку в subscribe
          return of({ launch: null, rocket: null, launchpad: null });
        }

        const rocket$ = launch.rocket
          ? api.getRocket(launch.rocket).pipe(catchError(() => of(null)))
          : of(null);

        const pad$ = launch.launchpad
          ? api.getLaunchpad(launch.launchpad).pipe(catchError(() => of(null)))
          : of(null);

        return forkJoin({ launch: of(launch), rocket: rocket$, launchpad: pad$ });
      })
    ).subscribe({
      next: ({ launch, rocket, launchpad }) => {
        if (!launch) {
          this.error = 'Launch not found';
          this.loading = false;
          return;
        }

        this.vm = {
          id: launch.id,
          name: launch.name,
          date: launch.date_utc,
          success: launch.success,
          details: launch.details,
          patch: launch.links?.patch?.small,
          article: launch.links?.article,
          webcast: launch.links?.webcast,
          images: launch.links?.flickr?.original ?? [],
          rocketName: rocket?.name ?? null,
          launchpadName: launchpad ? `${launchpad.name} (${launchpad.locality})` : null
        };
        this.loading = false;
        this.error = '';
      },
      error: () => {
        // сюда мы уже почти не попадём, но оставим на всякий случай
        this.error = 'Failed to load launch';
        this.loading = false;
      }
    });
  }
}
