import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

export class LogoutService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async logout(): Promise<void> {
    await this.authRepository.logout();
    useAuthStore.getState().clearAuth();
  }
}
