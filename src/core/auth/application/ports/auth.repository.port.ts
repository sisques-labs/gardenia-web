import type { AccountUser } from '@/core/auth/domain/models/account-user.model';
import type { AuthResponse } from '@/core/auth/domain/interfaces/auth-response.interface';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import type { RegisterData } from '@/core/auth/domain/interfaces/register-data.interface';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  me(): Promise<AccountUser>;
  refresh(): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<void>;
}
