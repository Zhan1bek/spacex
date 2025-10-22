import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SpacexService } from '../../services/spacex';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-launch-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './launch-detail.html',
  styleUrl: './launch-detail.css'
})
export class LaunchDetailComponent {
  // храним объект запуска прямо как any, чтобы не городить лишних проверок;
  // можешь сделать строгий тип Launch позже.
  vm: any = null;
  loading = true;
  error = '';

  constructor(route: ActivatedRoute, api: SpacexService) {
    // читаем параметр :id из URL и сразу идём за данными
    route.paramMap
      .pipe(switchMap(params => api.getLaunch(params.get('id')!)))
      .subscribe({
        next: (launch) => { this.vm = launch; this.loading = false; },
        error: () => { this.error = 'Failed to load launch'; this.loading = false; }
      });
  }
}
