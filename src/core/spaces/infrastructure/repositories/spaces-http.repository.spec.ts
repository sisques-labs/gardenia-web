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
import { SpacesHttpRepository, SPACES_FIND_BY_USER, SPACE_CREATE } from './spaces-http.repository';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const mockSpaces: Space[] = [
  {
    id: 'space-1',
    name: 'My Garden',
    ownerId: 'user-1',
    createdAt: '2024-01-01',
  },
  {
    id: 'space-2',
    name: 'Balcony',
    ownerId: 'user-1',
    createdAt: '2024-01-02',
  },
];

const mockSpace: Space = {
  id: 'space-3',
  name: 'New Space',
  ownerId: 'user-1',
  createdAt: '2024-01-03',
};

describe('SpacesHttpRepository', () => {
  let repository: SpacesHttpRepository;

  beforeEach(() => {
    repository = new SpacesHttpRepository();
    vi.clearAllMocks();
    vi.mocked(useAuthStore.getState).mockReturnValue({
      accessToken: 'token-123',
      currentUser: { id: 'user-1', email: 'user@example.com' },
      setAccessToken: vi.fn(),
      setCurrentUser: vi.fn(),
      clearAuth: vi.fn(),
    });
  });

  describe('GQL document constants', () => {
    it('SPACES_FIND_BY_USER is a valid GQL document', () => {
      expect(SPACES_FIND_BY_USER).toBeDefined();
      expect((SPACES_FIND_BY_USER as DocumentNode).kind).toBe('Document');
    });

    it('SPACE_CREATE is a valid GQL document', () => {
      expect(SPACE_CREATE).toBeDefined();
      expect((SPACE_CREATE as DocumentNode).kind).toBe('Document');
    });
  });

  describe('listByUser()', () => {
    it('calls apolloClient.query with SPACES_FIND_BY_USER and returns mapped Space[]', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spacesFindByUser: mockSpaces },
      } as never);

      const result = await repository.listByUser();

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({ query: SPACES_FIND_BY_USER });
      expect(result).toEqual(mockSpaces);
    });

    it('returns empty array when query returns empty list', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spacesFindByUser: [] },
      } as never);

      const result = await repository.listByUser();

      expect(result).toEqual([]);
    });

    it('propagates errors from apolloClient.query', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));

      await expect(repository.listByUser()).rejects.toThrow('Network error');
    });
  });

  describe('create()', () => {
    it('calls apolloClient.mutate with SPACE_CREATE and the name variable, returns created Space', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { spaceCreate: mockSpace },
      } as never);

      const result = await repository.create('New Space');

      expect(apolloClient.mutate).toHaveBeenCalledOnce();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: SPACE_CREATE,
        variables: { name: 'New Space' },
      });
      expect(result).toEqual(mockSpace);
    });

    it('propagates errors from apolloClient.mutate', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Mutation failed'));

      await expect(repository.create('New Space')).rejects.toThrow('Mutation failed');
    });
  });
});
