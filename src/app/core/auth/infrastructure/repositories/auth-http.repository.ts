import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountUser } from '../../domain/models/account-user.model';
import { AuthResponse } from '../../domain/interfaces/auth-response.interface';
import { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import { API_URL } from '../tokens/api-url.token';

@Injectable({ providedIn: 'root' })
export class AuthHttpRepository implements IAuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(email: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, { email, password });
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  me(): Observable<AccountUser> {
    return this.http.get<AccountUser>(`${this.apiUrl}/auth/me`);
  }
}
