import { Routes } from '@angular/router';

export const BRANDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./brand-list/brand-list').then((m) => m.BrandList),
  },
  {
    path: 'new',
    loadComponent: () => import('./brand-form/brand-form').then((m) => m.BrandForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./brand-form/brand-form').then((m) => m.BrandForm),
  },
];
