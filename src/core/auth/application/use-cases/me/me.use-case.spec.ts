import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeUseCase } from './me.use-case';
import type { IAuthRepository } from '@/core/auth/application/ports/auth.repository.port';

const mockRepository: IAuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  refresh: vi.fn(),
  forgotPassword: vi.fn(),
};

describe('MeUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the current user, stores it and returns it', async () => {
    const mockUser = { id: 'account-1', userId: 'user-1', email: 'a@b.com' };
    vi.mocked(mockRepository.me).mockResolvedValue(mockUser);
    const service = new MeUseCase(mockRepository);

    const result = await service.me();

    expect(result).toEqual(mockUser);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.me).mockRejectedValue(new Error('Unauthorized'));
    const service = new MeUseCase(mockRepository);

    await expect(service.me()).rejects.toThrow('Unauthorized');
  });
});
