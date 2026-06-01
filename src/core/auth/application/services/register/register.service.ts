import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { RegisterData } from '@/core/auth/domain/interfaces/register-data.interface';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

export class RegisterService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async register(data: RegisterData): Promise<{ spaceId?: string }> {
    const response = await this.authRepository.register(data);
    useAuthStore.getState().setAccessToken(response.accessToken);
    return { spaceId: response.spaceId };
  }
}
