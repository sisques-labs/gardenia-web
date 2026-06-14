import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSpaceMembersUseCase } from './get-space-members.use-case';
import type { IUsersRepository } from '@/core/users/application/ports/users.repository.port';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const mockMembers: User[] = [
  { id: 'user-1', status: 'active', username: 'jdoe', createdAt: '2024-01-01' },
  { id: 'user-2', status: 'invited', username: 'jane', createdAt: '2024-01-02' },
];

const mockRepository: IUsersRepository = {
  getById: vi.fn(),
  update: vi.fn(),
  listSpaceMembers: vi.fn(),
};

describe('GetSpaceMembersUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to repository and returns members', async () => {
    vi.mocked(mockRepository.listSpaceMembers).mockResolvedValue(mockMembers);
    const useCase = new GetSpaceMembersUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(mockMembers);
    expect(mockRepository.listSpaceMembers).toHaveBeenCalledOnce();
  });

  it('propagates repository error', async () => {
    vi.mocked(mockRepository.listSpaceMembers).mockRejectedValue(new Error('Fetch failed'));
    const useCase = new GetSpaceMembersUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Fetch failed');
  });
});
