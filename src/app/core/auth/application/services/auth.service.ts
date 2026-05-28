import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, switchMap, tap, throwError } from 'rxjs';
import { AccountUser } from '../../domain/models/account-user.model';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/ports/auth.repository.port';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repo = inject<IAuthRepository>(AUTH_REPOSITORY);
  private readonly router = inject(Router);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _currentUser = signal<AccountUser | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  login(email: string, password: string): Observable<void> {
    return this.repo.login(email, password).pipe(
      tap(res => this._accessToken.set(res.accessToken)),
      switchMap(() => this.loadCurrentUser()),
      map(() => void 0),
      catchError(err => throwError(() => err)),
    );
  }

  register(email: string, password: string): Observable<void> {
    return this.repo.register(email, password);
  }

  refresh(): Observable<string> {
    return this.repo.refresh().pipe(
      tap(res => this._accessToken.set(res.accessToken)),
      map(res => res.accessToken),
    );
  }

  logout(): Observable<void> {
    return this.repo.logout().pipe(
      finalize(() => this.clearSession()),
    );
  }

  loadCurrentUser(): Observable<AccountUser> {
    return this.repo.me().pipe(tap(user => this._currentUser.set(user)));
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    this.router.navigateByUrl('/login');
  }
}
