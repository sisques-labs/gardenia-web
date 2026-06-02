import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from './register.use-case';
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

describe('RegisterUseCase', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it('stores access token and returns spaceId on success', async () => {
    vi.mocked(mockRepository.register).mockResolvedValue({ accessToken: 'tok-abc', spaceId: 'space-1' });
    const service = new RegisterUseCase(mockRepository);

    const result = await service.register({ email: 'a@b.com', password: '123456' });

    expect(useAuthStore.getState().accessToken).toBe('tok-abc');
    expect(result.spaceId).toBe('space-1');
  });

  it('does not swallow spaceId from response', async () => {
    vi.mocked(mockRepository.register).mockResolvedValue({ accessToken: 'tok-xyz', spaceId: 'space-2' });
    const service = new RegisterUseCase(mockRepository);

    const result = await service.register({ email: 'x@y.com', password: 'pass' });

    expect(result.spaceId).toBe('space-2');
  });
});
