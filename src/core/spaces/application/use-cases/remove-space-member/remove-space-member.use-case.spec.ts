import { describe, it, expect, vi } from 'vitest';
import { RemoveSpaceMemberUseCase } from './remove-space-member.use-case';
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

describe('RemoveSpaceMemberUseCase', () => {
  it('calls repository.removeMember with the correct input', async () => {
    vi.mocked(mockRepository.removeMember).mockResolvedValue(undefined);

    const useCase = new RemoveSpaceMemberUseCase(mockRepository);
    await useCase.execute({ spaceId: 'space-1', targetUserId: 'user-2' });

    expect(mockRepository.removeMember).toHaveBeenCalledWith({ spaceId: 'space-1', targetUserId: 'user-2' });
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.removeMember).mockRejectedValue(new Error('Cannot remove last owner'));

    const useCase = new RemoveSpaceMemberUseCase(mockRepository);
    await expect(useCase.execute({ spaceId: 'space-1', targetUserId: 'user-1' })).rejects.toThrow('Cannot remove last owner');
  });
});
