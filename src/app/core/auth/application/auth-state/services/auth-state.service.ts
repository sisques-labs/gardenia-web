import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccountUser } from '../../../domain/models/account-user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly router = inject(Router);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _currentUser = signal<AccountUser | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
  }

  setCurrentUser(user: AccountUser | null): void {
    this._currentUser.set(user);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    this.router.navigateByUrl('/login');
  }
}
