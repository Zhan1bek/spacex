import { Routes } from '@angular/router';
import { LaunchList } from './components/launch-list/launch-list';

export const routes: Routes = [
  { path: '', component: LaunchList },
  {path: '**', redirectTo: ''}
];
