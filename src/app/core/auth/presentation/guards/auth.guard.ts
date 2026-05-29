import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStateService } from '@/core/auth/application/auth-state/auth-state.service';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  if (authState.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
