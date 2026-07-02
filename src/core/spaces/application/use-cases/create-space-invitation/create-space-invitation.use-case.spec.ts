import { describe, it, expect, vi } from 'vitest';
import { CreateSpaceInvitationUseCase } from './create-space-invitation.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';

const mockInvitation: SpaceInvitation = {
  id: 'inv-1',
  displayCode: 'GAR · 2026 · AB',
  code: 'full-code-uuid',
  qrId: 'qr-1',
  expiresAt: '2026-12-31T00:00:00.000Z',
  role: 'MEMBER',
  spaceId: 'space-1',
};

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
  getInvitationPreview: vi.fn(),
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getSpaceWeather: vi.fn(),
  update: vi.fn(),
};

describe('CreateSpaceInvitationUseCase', () => {
  it('returns SpaceInvitation from repository', async () => {
    vi.mocked(mockRepository.createInvitation).mockResolvedValue(mockInvitation);

    const useCase = new CreateSpaceInvitationUseCase(mockRepository);
    const result = await useCase.execute({ spaceId: 'space-1', role: 'member' });

    expect(mockRepository.createInvitation).toHaveBeenCalledWith({ spaceId: 'space-1', role: 'member' });
    expect(result).toEqual(mockInvitation);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.createInvitation).mockRejectedValue(new Error('Only owners can create invitations'));

    const useCase = new CreateSpaceInvitationUseCase(mockRepository);
    await expect(useCase.execute({ spaceId: 'space-1' })).rejects.toThrow('Only owners can create invitations');
  });
});
