import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUseCase } from './logout.use-case';
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

describe('LogoutUseCase', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: 'tok', currentUser: { id: '1', email: 'a@b.com' } });
    vi.clearAllMocks();
  });

  it('clears auth state after logout', async () => {
    vi.mocked(mockRepository.logout).mockResolvedValue(undefined);
    const service = new LogoutUseCase(mockRepository);

    await service.logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().currentUser).toBeNull();
  });
});
