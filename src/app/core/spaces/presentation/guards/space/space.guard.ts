import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SpacesStateService } from '@/core/spaces/application/services/spaces-state/spaces-state.service';

export const spaceGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const spacesState = inject(SpacesStateService);
  const router = inject(Router);

  if (!spacesState.isResolved()) {
    return spacesState.loadSpaces().pipe(
      map(() => {
        const space = spacesState.currentSpace();
        if (space !== null) return true;
        return router.createUrlTree(['/spaces/new']);
      }),
    );
  }

  const space = spacesState.currentSpace();
  if (space !== null) return true;
  return router.createUrlTree(['/spaces/new']);
};
