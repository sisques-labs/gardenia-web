import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountUser } from '../models/account-user.model';
import { AuthResponse } from '../interfaces/auth-response.interface';

export interface IAuthRepository {
  login(email: string, password: string): Observable<AuthResponse>;
  register(email: string, password: string): Observable<void>;
  refresh(): Observable<AuthResponse>;
  logout(): Observable<void>;
  me(): Observable<AccountUser>;
}

export const AUTH_REPOSITORY = new InjectionToken<IAuthRepository>('AUTH_REPOSITORY');
