import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'brands',
        loadChildren: () => import('./features/brands/brands.routes').then((m) => m.BRANDS_ROUTES),
      },
      {
        path: 'outfits',
        loadChildren: () => import('./features/outfits/outfits.routes').then((m) => m.OUTFITS_ROUTES),
      },
      {
        path: 'articles',
        loadChildren: () => import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'wizards/outfit',
        loadComponent: () =>
          import('./features/wizards/outfit-wizard/outfit-wizard').then((m) => m.OutfitWizard),
      },
      {
        path: 'wizards/article',
        loadComponent: () =>
          import('./features/wizards/article-wizard/article-wizard').then((m) => m.ArticleWizard),
      },
      {
        path: 'scenarios',
        loadChildren: () => import('./features/scenarios/scenarios.routes').then((m) => m.SCENARIOS_ROUTES),
      },
    ],
  },
];
