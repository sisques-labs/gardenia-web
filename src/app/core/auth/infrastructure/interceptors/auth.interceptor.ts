import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStateService } from '@/core/auth/application/auth-state/services/auth-state.service';
import { RefreshService } from '@/core/auth/application/refresh/services/refresh.service';

// Module-level mutex — single instance per app, safe under zoneless.
let isRefreshing = false;
const refreshed$ = new Subject<string | null>();

function shouldSkipAuth(req: HttpRequest<unknown>): boolean {
  return req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');
}

function isRefreshUrl(req: HttpRequest<unknown>): boolean {
  return req.url.endsWith('/auth/refresh');
}

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthStateService);
  const refreshSvc = inject(RefreshService);
  const token = state.accessToken();

  const initial = !shouldSkipAuth(req) && token ? withBearer(req, token) : req;

  return next(initial).pipe(
    catchError((err: unknown): Observable<never> => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      // If the failing request was /auth/refresh itself → hard logout, no retry.
      if (isRefreshUrl(req)) {
        state.clearSession();
        return throwError(() => err);
      }

      // A refresh is already in flight → wait for its result.
      if (isRefreshing) {
        return refreshed$.pipe(
          filter((t): t is string => t !== null),
          take(1),
          switchMap(newToken => next(withBearer(req, newToken))),
        ) as Observable<never>;
      }

      // Start a new refresh cycle.
      isRefreshing = true;
      return refreshSvc.refresh().pipe(
        switchMap(newToken => {
          isRefreshing = false;
          refreshed$.next(newToken);
          return next(withBearer(req, newToken));
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          refreshed$.next(null);
          state.clearSession();
          return throwError(() => refreshErr);
        }),
      ) as Observable<never>;
    }),
  );
};
