import { describe, it, expect, vi } from 'vitest';
import { AddSpaceMemberUseCase } from './add-space-member.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
};

describe('AddSpaceMemberUseCase', () => {
  it('calls repository.addMember with the correct input', async () => {
    vi.mocked(mockRepository.addMember).mockResolvedValue(undefined);

    const useCase = new AddSpaceMemberUseCase(mockRepository);
    await useCase.execute({ spaceId: 'space-1', targetUserId: 'user-2' });

    expect(mockRepository.addMember).toHaveBeenCalledWith({ spaceId: 'space-1', targetUserId: 'user-2' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.addMember).mockRejectedValue(new Error('Already a member'));

    const useCase = new AddSpaceMemberUseCase(mockRepository);
    await expect(useCase.execute({ spaceId: 'space-1', targetUserId: 'user-2' })).rejects.toThrow('Already a member');
  });
});
