import { Routes } from '@angular/router';
import { LaunchList } from './components/launch-list/launch-list';
import { LaunchDetailComponent } from './components/launch-detail/launch-detail';

export const routes: Routes = [
  { path: '', component: LaunchList },
  { path: 'launch/:id', component: LaunchDetailComponent },
  {path: '**', redirectTo: ''}
];
