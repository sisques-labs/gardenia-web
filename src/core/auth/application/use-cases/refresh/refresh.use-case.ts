import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

export class RefreshUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async refresh(): Promise<string> {
    const response = await this.authRepository.refresh();
    return response.accessToken;
  }
}
