import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { LoginCredentials } from '@/core/auth/domain/interfaces/login-credentials.interface';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await this.authRepository.login(credentials);
    useAuthStore.getState().setAccessToken(response.accessToken);
    await new MeUseCase(this.authRepository).me();
  }
}
