import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';
import type { AccountUser } from '@/core/auth/domain/models/account-user.model';

export class MeUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async me(): Promise<AccountUser> {
    return this.authRepository.me();
  }
}
