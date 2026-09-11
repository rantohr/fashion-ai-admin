import { Routes } from '@angular/router';

export const SCENARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./scenario-list/scenario-list').then((m) => m.ScenarioList),
  },
  {
    path: 'new',
    loadComponent: () => import('./scenario-form/scenario-form').then((m) => m.ScenarioForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./scenario-results/scenario-results').then((m) => m.ScenarioResults),
  },
];
