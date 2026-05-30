import { Routes } from '@angular/router';
import { guestGuard } from '@/core/auth/presentation/guards/guest/guest.guard';
import { authGuard } from '@/core/auth/presentation/guards/auth/auth.guard';
import { spaceGuard } from '@/core/spaces/presentation/guards/space/space.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@/core/auth/presentation/pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@/core/auth/presentation/pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'spaces/new',
    loadComponent: () =>
      import('@/core/spaces/presentation/pages/space-create/space-create.page').then(
        m => m.SpaceCreatePage,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('@/core/spaces/presentation/layouts/shell/shell.layout').then(m => m.ShellLayout),
    canActivate: [authGuard, spaceGuard],
    children: [
      {
        path: 'spaces',
        loadComponent: () =>
          import('@/core/spaces/presentation/pages/space-list/space-list.page').then(
            m => m.SpaceListPage,
          ),
      },
    ],
  },
];
