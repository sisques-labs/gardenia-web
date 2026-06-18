import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { SpacesGqlRepository } from './spaces.gql.repository';
import { SPACES_FIND_BY_USER } from './queries/spaces-find-by-user.query';
import { SPACE_FIND_BY_ID } from './queries/space-find-by-id.query';
import { SPACE_ACCEPT_INVITATION } from './mutations/space-accept-invitation.mutation';
import { SPACE_CREATE } from './mutations/space-create.mutation';
import { SPACE_CREATE_INVITATION } from './mutations/space-create-invitation.mutation';
import { SPACE_ADD_MEMBER } from './mutations/space-add-member.mutation';
import { SPACE_REMOVE_MEMBER } from './mutations/space-remove-member.mutation';
import { SPACE_UPDATE } from './mutations/space-update-geolocation.mutation';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';

const mockSpaces: Space[] = [
  { id: 'space-1', name: 'My Garden', ownerId: 'user-1', createdAt: '2024-01-01' },
  { id: 'space-2', name: 'Balcony', ownerId: 'user-1', createdAt: '2024-01-02' },
];

describe('SpacesGqlRepository', () => {
  let repository: SpacesGqlRepository;

  beforeEach(() => {
    repository = new SpacesGqlRepository();
    vi.clearAllMocks();
    vi.mocked(useAuthStore.getState).mockReturnValue({
      accessToken: 'token-123',
      currentUser: { id: 'account-1', userId: 'user-1', email: 'user@example.com' },
      isBootComplete: true,
      setAccessToken: vi.fn(),
      setCurrentUser: vi.fn(),
      clearAuth: vi.fn(),
      setBootComplete: vi.fn(),
      redirectToLogin: vi.fn(),
    });
  });

  describe('GQL document constants', () => {
    it('SPACES_FIND_BY_USER is a valid GQL document', () => {
      expect(SPACES_FIND_BY_USER).toBeDefined();
      expect((SPACES_FIND_BY_USER as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_FIND_BY_ID is a valid GQL document', () => {
      expect(SPACE_FIND_BY_ID).toBeDefined();
      expect((SPACE_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_CREATE is a valid GQL document', () => {
      expect(SPACE_CREATE).toBeDefined();
      expect((SPACE_CREATE as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_ACCEPT_INVITATION is a valid GQL document', () => {
      expect(SPACE_ACCEPT_INVITATION).toBeDefined();
      expect((SPACE_ACCEPT_INVITATION as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_CREATE_INVITATION is a valid GQL document', () => {
      expect(SPACE_CREATE_INVITATION).toBeDefined();
      expect((SPACE_CREATE_INVITATION as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_ADD_MEMBER is a valid GQL document', () => {
      expect(SPACE_ADD_MEMBER).toBeDefined();
      expect((SPACE_ADD_MEMBER as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_REMOVE_MEMBER is a valid GQL document', () => {
      expect(SPACE_REMOVE_MEMBER).toBeDefined();
      expect((SPACE_REMOVE_MEMBER as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_UPDATE is a valid GQL document', () => {
      expect(SPACE_UPDATE).toBeDefined();
      expect((SPACE_UPDATE as DocumentNode).kind).toBe('Document');
    });
  });

  describe('listByUser()', () => {
    it('returns Space[] from the paginated items field', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spacesFindByUser: { items: mockSpaces } },
      } as never);

      const result = await repository.listByUser();

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: SPACES_FIND_BY_USER,
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockSpaces);
    });

    it('returns empty array when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spacesFindByUser: { items: [] } },
      } as never);

      const result = await repository.listByUser();
      expect(result).toEqual([]);
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.listByUser()).rejects.toThrow('Network error');
    });
  });

  describe('acceptInvitation()', () => {
    it('calls mutate with code input and succeeds when success is true', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: {
          spaceAcceptInvitation: {
            id: 'space-joined',
            success: true,
            message: 'Invitation accepted successfully',
          },
        },
      } as never);

      const spaceId = await repository.acceptInvitation('TES · 2026 · AB');

      expect(spaceId).toBe('space-joined');
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_ACCEPT_INVITATION,
        variables: { input: { code: 'TES · 2026 · AB' } },
      });
    });

    it('throws when mutation returns success: false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: {
          spaceAcceptInvitation: {
            id: '',
            success: false,
            message: 'Invitation expired',
          },
        },
      } as never);

      await expect(repository.acceptInvitation('TES · 2026 · AB')).rejects.toThrow(
        'Invitation expired',
      );
    });
  });

  describe('create()', () => {
    it('calls mutate with input wrapper and reconstructs Space from response + input', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceCreate: { id: 'space-3', success: true, message: 'Space created successfully' } },
      } as never);

      const result = await repository.create('New Space');

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_CREATE,
        variables: { input: { name: 'New Space' } },
      });
      expect(result.id).toBe('space-3');
      expect(result.name).toBe('New Space');
      expect(result.ownerId).toBe('user-1');
    });

    it('throws when mutation returns success: false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(repository.create('New Space')).rejects.toThrow('spaceCreate mutation failed');
    });

    it('propagates errors from apolloClient.mutate', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Mutation failed'));
      await expect(repository.create('New Space')).rejects.toThrow('Mutation failed');
    });
  });

  describe('findById()', () => {
    const mockDetail: SpaceDetail = {
      id: 'space-1',
      name: 'My Garden',
      ownerId: 'user-1',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    it('returns SpaceDetail when space is found', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spaceFindById: mockDetail },
      } as never);

      const result = await repository.findById('space-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: SPACE_FIND_BY_ID,
        variables: { input: { id: 'space-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockDetail);
    });

    it('throws when spaceFindById is null', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spaceFindById: null },
      } as never);

      await expect(repository.findById('space-1')).rejects.toThrow('Space not found: space-1');
    });
  });

  describe('createInvitation()', () => {
    const mockInvitation: SpaceInvitation = {
      id: 'inv-1',
      displayCode: 'GAR · 2026 · AB',
      code: 'full-code-uuid',
      qrId: 'qr-1',
      expiresAt: '2026-12-31T00:00:00.000Z',
      role: 'MEMBER',
      spaceId: 'space-1',
    };

    it('returns SpaceInvitation on success', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceCreateInvitation: mockInvitation },
      } as never);

      const result = await repository.createInvitation({ spaceId: 'space-1', role: 'member' });

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_CREATE_INVITATION,
        variables: { input: { spaceId: 'space-1', role: 'MEMBER', expiresAt: undefined } },
      });
      expect(result).toEqual(mockInvitation);
    });

    it('throws when mutation returns no data', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceCreateInvitation: null },
      } as never);

      await expect(repository.createInvitation({ spaceId: 'space-1' })).rejects.toThrow(
        'spaceCreateInvitation mutation failed',
      );
    });
  });

  describe('addMember()', () => {
    it('resolves when mutation succeeds', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceAddMember: { id: 'space-1', success: true, message: 'Member added' } },
      } as never);

      await expect(
        repository.addMember({ spaceId: 'space-1', targetUserId: 'user-2' }),
      ).resolves.toBeUndefined();

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_ADD_MEMBER,
        variables: { input: { spaceId: 'space-1', targetUserId: 'user-2' } },
      });
    });

    it('throws when success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceAddMember: { id: '', success: false, message: 'Already a member' } },
      } as never);

      await expect(
        repository.addMember({ spaceId: 'space-1', targetUserId: 'user-2' }),
      ).rejects.toThrow('Already a member');
    });
  });

  describe('removeMember()', () => {
    it('resolves when mutation succeeds', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceRemoveMember: { id: 'space-1', success: true, message: 'Member removed' } },
      } as never);

      await expect(
        repository.removeMember({ spaceId: 'space-1', targetUserId: 'user-2' }),
      ).resolves.toBeUndefined();

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_REMOVE_MEMBER,
        variables: { input: { spaceId: 'space-1', targetUserId: 'user-2' } },
      });
    });

    it('throws when success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceRemoveMember: { id: '', success: false, message: 'Cannot remove last owner' } },
      } as never);

      await expect(
        repository.removeMember({ spaceId: 'space-1', targetUserId: 'user-2' }),
      ).rejects.toThrow('Cannot remove last owner');
    });
  });

  describe('getSpaceWeather()', () => {
    const mockWeather: SpaceWeather = {
      latitude: 40.4,
      longitude: -3.7,
      timezone: 'Europe/Madrid',
      daily: [],
    };

    it('returns weather from spaceFindById response', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spaceFindById: { weather: mockWeather } },
      } as never);

      const result = await repository.getSpaceWeather('space-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: SPACE_FIND_BY_ID,
        variables: { input: { id: 'space-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockWeather);
    });

    it('returns null when weather is missing', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spaceFindById: { weather: null } },
      } as never);

      const result = await repository.getSpaceWeather('space-1');

      expect(result).toBeNull();
    });
  });

  describe('updateGeolocation()', () => {
    const input = {
      id: 'space-1',
      latitude: 40.4,
      longitude: -3.7,
      environment: 'OUTDOOR' as const,
    };

    it('resolves when mutation succeeds', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceUpdate: { id: 'space-1', success: true, message: 'Updated' } },
      } as never);

      await expect(repository.updateGeolocation(input)).resolves.toBeUndefined();

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_UPDATE,
        variables: { input },
      });
    });

    it('throws when success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceUpdate: { id: '', success: false, message: 'Invalid coordinates' } },
      } as never);

      await expect(repository.updateGeolocation(input)).rejects.toThrow('Invalid coordinates');
    });
  });
});
