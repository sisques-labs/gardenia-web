import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetNodesUseCase } from './get-nodes.use-case';
import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

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

const mockRepository: INodesRepository = {
  listBridges: vi.fn(),
  listNodes: vi.fn(),
  claimBridge: vi.fn(),
};

describe('GetNodesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns nodes from the repository', async () => {
    vi.mocked(mockRepository.listNodes).mockResolvedValue(mockNodes);
    const useCase = new GetNodesUseCase(mockRepository);

    expect(await useCase.execute()).toEqual(mockNodes);
  });

  it('returns an empty array when there are no nodes', async () => {
    vi.mocked(mockRepository.listNodes).mockResolvedValue([]);
    const useCase = new GetNodesUseCase(mockRepository);

    expect(await useCase.execute()).toEqual([]);
  });
});
