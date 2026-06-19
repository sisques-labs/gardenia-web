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
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getSpaceWeather: vi.fn(),
  update: vi.fn(),
};

describe('AcceptSpaceInvitationUseCase', () => {
  beforeEach(() => {
    useSpacesStore.getState().clear();
    useSpacesStore.getState().setSpaces([homeSpace]);
    useSpacesStore.getState().setActiveSpace(homeSpace.id);
    vi.clearAllMocks();
  });

  it('activates joined space immediately and refreshes spaces in the background', async () => {
    vi.mocked(mockRepository.acceptInvitation).mockResolvedValue(joinedSpace.id);
    vi.mocked(mockRepository.listByUser).mockResolvedValue([homeSpace, joinedSpace]);

    const useCase = new AcceptSpaceInvitationUseCase(mockRepository);
    const result = await useCase.execute('TES · 2026 · AB');

    expect(mockRepository.acceptInvitation).toHaveBeenCalledWith('TES · 2026 · AB');
    expect(result).toBe(joinedSpace.id);
    expect(useSpacesStore.getState().currentSpaceId).toBe('space-joined');

    await vi.waitFor(() => {
      expect(useSpacesStore.getState().availableSpaces).toEqual([homeSpace, joinedSpace]);
    });
  });
});
