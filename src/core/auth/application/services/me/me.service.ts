import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

export class MeService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async me(): Promise<AccountUser> {
    const user = await this.authRepository.me();
    useAuthStore.getState().setCurrentUser(user);
    return user;
  }
}
