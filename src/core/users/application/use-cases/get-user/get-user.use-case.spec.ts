import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserUseCase } from './get-user.use-case';
import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const mockUser: User = {
  id: 'user-1',
  status: 'active',
  username: 'jdoe',
  createdAt: '2024-01-01',
};

const mockRepository: IUsersRepository = {
  getById: vi.fn(),
  update: vi.fn(),
  listSpaceMembers: vi.fn(),
};

describe('GetUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the user from the repository', async () => {
    vi.mocked(mockRepository.getById).mockResolvedValue(mockUser);
    const useCase = new GetUserUseCase(mockRepository);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(mockUser);
    expect(mockRepository.getById).toHaveBeenCalledWith('user-1');
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.getById).mockRejectedValue(new Error('Not found'));
    const useCase = new GetUserUseCase(mockRepository);

    await expect(useCase.execute('user-1')).rejects.toThrow('Not found');
  });
});
