import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from './login.use-case';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

const mockRepository: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
  forgotPassword: vi.fn(),
};

describe('LoginUseCase', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it('stores access token and current user on successful login', async () => {
    vi.mocked(mockRepository.login).mockResolvedValue({ accessToken: 'tok-123' });
    vi.mocked(mockRepository.me).mockResolvedValue({
      id: 'account-1',
      userId: 'user-1',
      email: 'a@b.com',
    });
    const service = new LoginUseCase(mockRepository);

    await service.login({ email: 'a@b.com', password: '123456' });

    expect(useAuthStore.getState().accessToken).toBe('tok-123');
    expect(useAuthStore.getState().currentUser).toEqual({
      id: 'account-1',
      userId: 'user-1',
      email: 'a@b.com',
    });
    expect(mockRepository.me).toHaveBeenCalledOnce();
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.login).mockRejectedValue(new Error('Invalid credentials'));
    const service = new LoginUseCase(mockRepository);

    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});
