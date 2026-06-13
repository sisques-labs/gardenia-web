import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefreshUseCase } from './refresh.use-case';
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

describe('RefreshUseCase', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it('refreshes the token, stores it and returns it', async () => {
    vi.mocked(mockRepository.refresh).mockResolvedValue({ accessToken: 'new-tok' });
    const service = new RefreshUseCase(mockRepository);

    const token = await service.refresh();

    expect(token).toBe('new-tok');
    expect(useAuthStore.getState().accessToken).toBe('new-tok');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.refresh).mockRejectedValue(new Error('Session expired'));
    const service = new RefreshUseCase(mockRepository);

    await expect(service.refresh()).rejects.toThrow('Session expired');
  });
});
