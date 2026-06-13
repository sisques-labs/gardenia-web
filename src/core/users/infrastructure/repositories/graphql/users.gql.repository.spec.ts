import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { UsersGqlRepository } from './users.gql.repository';
import { USER_FIND_BY_ID } from './queries/user-find-by-id.query';
import { USER_UPDATE } from './mutations/user-update.mutation';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const mockUser: User = {
  id: 'user-1',
  status: 'active',
  username: 'jdoe',
  createdAt: '2024-01-01',
};

describe('UsersGqlRepository', () => {
  let repository: UsersGqlRepository;

  beforeEach(() => {
    repository = new UsersGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it('USER_FIND_BY_ID is a valid GQL document', () => {
      expect(USER_FIND_BY_ID).toBeDefined();
      expect((USER_FIND_BY_ID as DocumentNode).kind).toBe('Document');
    });

    it('USER_UPDATE is a valid GQL document', () => {
      expect(USER_UPDATE).toBeDefined();
      expect((USER_UPDATE as DocumentNode).kind).toBe('Document');
    });
  });

  describe('getById()', () => {
    it('returns the user when found', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { userFindById: mockUser },
      } as never);

      const result = await repository.getById('user-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: USER_FIND_BY_ID,
        variables: { input: { id: 'user-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockUser);
    });

    it('throws when userFindById is null', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { userFindById: null },
      } as never);

      await expect(repository.getById('user-1')).rejects.toThrow('User not found: user-1');
    });

    it('propagates query errors', async () => {
      vi.mocked(apolloClient.query).mockRejectedValue(new Error('Network error'));
      await expect(repository.getById('user-1')).rejects.toThrow('Network error');
    });
  });

  describe('update()', () => {
    it('calls userUpdate mutation with the given input', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({} as never);

      await repository.update({ id: 'user-1', username: 'newname' });

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: USER_UPDATE,
        variables: { input: { id: 'user-1', username: 'newname' } },
      });
    });

    it('propagates mutation errors', async () => {
      vi.mocked(apolloClient.mutate).mockRejectedValue(new Error('Update failed'));
      await expect(repository.update({ id: 'user-1' })).rejects.toThrow('Update failed');
    });
  });
});
