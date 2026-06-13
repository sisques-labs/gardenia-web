import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';

export interface LoginResult {
  accessToken: string;
  user: AccountUser;
}

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await this.authRepository.login(credentials);
    const user = await this.authRepository.me();
    return { accessToken: response.accessToken, user };
  }
}
