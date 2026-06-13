import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from './login.use-case';
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
    vi.clearAllMocks();
  });

  it('returns access token and user on successful login', async () => {
    const mockUser = { id: 'account-1', userId: 'user-1', email: 'a@b.com' };
    vi.mocked(mockRepository.login).mockResolvedValue({ accessToken: 'tok-123' });
    vi.mocked(mockRepository.me).mockResolvedValue(mockUser);
    const service = new LoginUseCase(mockRepository);

    const result = await service.login({ email: 'a@b.com', password: '123456' });

    expect(result).toEqual({ accessToken: 'tok-123', user: mockUser });
    expect(mockRepository.me).toHaveBeenCalledOnce();
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.login).mockRejectedValue(new Error('Invalid credentials'));
    const service = new LoginUseCase(mockRepository);

    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });
});
