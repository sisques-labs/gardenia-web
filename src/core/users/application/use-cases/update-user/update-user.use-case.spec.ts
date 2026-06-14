import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateUserUseCase } from './update-user.use-case';
import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';

const mockRepository: IUsersRepository = {
  getById: vi.fn(),
  update: vi.fn(),
  listSpaceMembers: vi.fn(),
};

describe('UpdateUserUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the update to the repository', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(undefined);
    const useCase = new UpdateUserUseCase(mockRepository);

    await useCase.execute({ id: 'user-1', username: 'newname' });

    expect(mockRepository.update).toHaveBeenCalledWith({ id: 'user-1', username: 'newname' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.update).mockRejectedValue(new Error('Update failed'));
    const useCase = new UpdateUserUseCase(mockRepository);

    await expect(useCase.execute({ id: 'user-1' })).rejects.toThrow('Update failed');
  });
});
