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
  { id: 'space-1', name: 'My Garden', ownerId: 'user-1', createdAt: '2024-01-01' },
  { id: 'space-2', name: 'Balcony', ownerId: 'user-1', createdAt: '2024-01-02' },
];

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
    it('returns Space[] from the paginated items field', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { spacesFindByUser: { items: mockSpaces } },
      } as never);

      const result = await repository.listByUser();

      expect(apolloClient.query).toHaveBeenCalledOnce();
      expect(apolloClient.query).toHaveBeenCalledWith({ query: SPACES_FIND_BY_USER });
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
});
