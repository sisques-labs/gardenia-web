import { describe, it, expect, vi } from 'vitest';
import { GetSpaceInvitationPreviewUseCase } from './get-space-invitation-preview.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';

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

describe('GetSpaceInvitationPreviewUseCase', () => {
  it('delegates to the repository and returns the preview', async () => {
    const preview = {
      spaceName: 'Greenhouse A',
      role: 'MEMBER' as const,
      expiresAt: '2026-12-31T00:00:00.000Z',
      isExpired: false,
    };
    vi.mocked(mockRepository.getInvitationPreview).mockResolvedValue(preview);

    const useCase = new GetSpaceInvitationPreviewUseCase(mockRepository);
    const result = await useCase.execute('TES · 2026 · AB');

    expect(mockRepository.getInvitationPreview).toHaveBeenCalledWith('TES · 2026 · AB');
    expect(result).toBe(preview);
  });

  it('propagates errors from the repository', async () => {
    vi.mocked(mockRepository.getInvitationPreview).mockRejectedValue(
      new Error('Invitation not found'),
    );

    const useCase = new GetSpaceInvitationPreviewUseCase(mockRepository);

    await expect(useCase.execute('BADCODE')).rejects.toThrow('Invitation not found');
  });
});
