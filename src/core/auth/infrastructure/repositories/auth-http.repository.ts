import { http } from '@/shared/infrastructure/http/axios.client';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';
import type { AuthResponse } from '@/core/auth/domain/interfaces/auth-response.interface';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import type { RegisterData } from '@/core/auth/domain/interfaces/register-data.interface';

export class AuthHttpRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>('/auth/register', data);
    return res.data;
  }

  async logout(): Promise<void> {
    await http.post('/auth/logout');
  }

  async me(): Promise<AccountUser> {
    const res = await http.get<AccountUser>('/auth/me');
    return res.data;
  }

  async refresh(): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>('/auth/refresh');
    return res.data;
  }
}

export const authHttpRepository = new AuthHttpRepository();
