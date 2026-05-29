import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStateService } from '@/core/auth/application/auth-state/auth-state.service';

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  return authState.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
