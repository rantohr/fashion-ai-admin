import { Routes } from '@angular/router';

// Minimal: list admins + create one, no self-service password reset flow.
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list').then((m) => m.UserList),
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form').then((m) => m.UserForm),
  },
];
