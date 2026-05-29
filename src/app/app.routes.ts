import { Routes } from '@angular/router';
import { guestGuard } from '@/core/auth/presentation/guards/guest/guest.guard';

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
];
