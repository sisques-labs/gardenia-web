import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    await this.authRepository.forgotPassword(email);
  }
}
