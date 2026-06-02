import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

const mockRepository: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
  forgotPassword: vi.fn(),
};

describe('ForgotPasswordUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates call to repository with the email', async () => {
    vi.mocked(mockRepository.forgotPassword).mockResolvedValue(undefined);
    const useCase = new ForgotPasswordUseCase(mockRepository);

    await useCase.execute('user@example.com');

    expect(mockRepository.forgotPassword).toHaveBeenCalledOnce();
    expect(mockRepository.forgotPassword).toHaveBeenCalledWith('user@example.com');
  });

  it('propagates 5xx/network errors from repository', async () => {
    vi.mocked(mockRepository.forgotPassword).mockRejectedValue(new Error('Server error'));
    const useCase = new ForgotPasswordUseCase(mockRepository);

    await expect(useCase.execute('user@example.com')).rejects.toThrow('Server error');
  });
});
