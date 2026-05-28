import { Routes } from '@angular/router';
import { guestGuard } from '@/auth/presentation/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@/auth/presentation/pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@/auth/presentation/pages/register/register.page').then(m => m.RegisterPage),
  },
];
