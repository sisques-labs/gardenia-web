import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcceptSpaceInvitationUseCase } from './accept-space-invitation.use-case';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const homeSpace: Space = {
  id: 'space-home',
  name: 'Home',
  ownerId: 'user-1',
  createdAt: '2024-01-01',
};

const joinedSpace: Space = {
  id: 'space-joined',
  name: 'Shared Garden',
  ownerId: 'user-2',
  createdAt: '2024-01-02',
};

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
};

describe('AcceptSpaceInvitationUseCase', () => {
  beforeEach(() => {
    useSpacesStore.getState().clear();
    useSpacesStore.getState().setSpaces([homeSpace]);
    useSpacesStore.getState().setActiveSpace(homeSpace.id);
    vi.clearAllMocks();
  });

  it('accepts invitation, refreshes spaces, and activates the newly joined space', async () => {
    vi.mocked(mockRepository.acceptInvitation).mockResolvedValue(undefined);
    vi.mocked(mockRepository.listByUser).mockResolvedValue([homeSpace, joinedSpace]);

    const useCase = new AcceptSpaceInvitationUseCase(mockRepository);
    const result = await useCase.execute('TES · 2026 · AB');

    expect(mockRepository.acceptInvitation).toHaveBeenCalledWith('TES · 2026 · AB');
    expect(result).toEqual(joinedSpace);
    expect(useSpacesStore.getState().availableSpaces).toEqual([homeSpace, joinedSpace]);
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-joined');
  });
});
