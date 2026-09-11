import { Routes } from '@angular/router';

export const OUTFITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./outfit-list/outfit-list').then((m) => m.OutfitList),
  },
  {
    path: 'new',
    loadComponent: () => import('./outfit-form/outfit-form').then((m) => m.OutfitForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./outfit-form/outfit-form').then((m) => m.OutfitForm),
  },
];
