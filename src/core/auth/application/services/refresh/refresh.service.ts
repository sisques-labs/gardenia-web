import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

export class RefreshService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async refresh(): Promise<string> {
    const response = await this.authRepository.refresh();
    useAuthStore.getState().setAccessToken(response.accessToken);
    return response.accessToken;
  }
}
