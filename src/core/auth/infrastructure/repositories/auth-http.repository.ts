import { http } from '@/shared/infrastructure/http/ky.client';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';
import type { AuthResponse } from '@/core/auth/domain/interfaces/auth-response.interface';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import type { RegisterData } from '@/core/auth/domain/interfaces/register-data.interface';

export class AuthHttpRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return http.post('auth/login', { json: credentials }).json<AuthResponse>();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return http.post('auth/register', { json: data }).json<AuthResponse>();
  }

  async logout(): Promise<void> {
    await http.post('auth/logout');
  }

  async me(): Promise<AccountUser> {
    return http.get('auth/me').json<AccountUser>();
  }

  async refresh(): Promise<AuthResponse> {
    return http.post('auth/refresh').json<AuthResponse>();
  }
}

export const authHttpRepository = new AuthHttpRepository();
