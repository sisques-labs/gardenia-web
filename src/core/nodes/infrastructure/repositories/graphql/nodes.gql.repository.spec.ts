import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { NodesGqlRepository } from './nodes.gql.repository';
import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

const mockBridges: Bridge[] = [
  {
    id: 'bridge-1',
    spaceId: 'space-1',
    name: null,
    status: 'ACTIVE',
    lastSeenAt: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockNodes: Node[] = [
  {
    id: 'node-1',
    spaceId: 'space-1',
    bridgeId: 'bridge-1',
    name: null,
    status: 'ONLINE',
    lastSeenAt: '2024-01-02',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('NodesGqlRepository', () => {
  let repository: NodesGqlRepository;

  beforeEach(() => {
    repository = new NodesGqlRepository();
    vi.clearAllMocks();
  });

  describe('listBridges', () => {
    it('returns bridges from the query response', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { bridgesFindByCriteria: { items: mockBridges, total: 1, page: 1, perPage: 10, totalPages: 1 } },
      } as never);

      const result = await repository.listBridges();

      expect(result).toEqual(mockBridges);
    });

    it('returns an empty array when there is no data', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({ data: undefined } as never);

      expect(await repository.listBridges()).toEqual([]);
    });
  });

  describe('listNodes', () => {
    it('returns nodes from the query response', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { nodesFindByCriteria: { items: mockNodes, total: 1, page: 1, perPage: 10, totalPages: 1 } },
      } as never);

      const result = await repository.listNodes();

      expect(result).toEqual(mockNodes);
    });
  });

  describe('claimBridge', () => {
    it('resolves when the mutation succeeds', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { bridgeClaim: { id: 'bridge-1', success: true, message: 'ok' } },
      } as never);

      await expect(repository.claimBridge('bridge-1', 'GRDN-4F7K')).resolves.toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { input: { bridgeId: 'bridge-1', pairingCode: 'GRDN-4F7K' } },
        }),
      );
    });

    it('throws with the server message when the mutation fails', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { bridgeClaim: { id: '', success: false, message: 'Invalid pairing code' } },
      } as never);

      await expect(repository.claimBridge('bridge-1', 'WRONG')).rejects.toThrow(
        'Invalid pairing code',
      );
    });
  });
});
