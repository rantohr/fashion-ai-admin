import { Routes } from '@angular/router';

export const ARTICLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article-list/article-list').then((m) => m.ArticleList),
  },
  {
    path: 'new',
    loadComponent: () => import('./article-form/article-form').then((m) => m.ArticleForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./article-form/article-form').then((m) => m.ArticleForm),
  },
];
