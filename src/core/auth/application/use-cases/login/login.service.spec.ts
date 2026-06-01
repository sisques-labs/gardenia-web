import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginService } from './login.service';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

const mockRepository: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
};

describe('LoginService', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it('stores access token on successful login', async () => {
    vi.mocked(mockRepository.login).mockResolvedValue({ accessToken: 'tok-123' });
    const service = new LoginService(mockRepository);

    await service.login({ email: 'a@b.com', password: '123456' });

    expect(useAuthStore.getState().accessToken).toBe('tok-123');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.login).mockRejectedValue(new Error('Invalid credentials'));
    const service = new LoginService(mockRepository);

    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});
