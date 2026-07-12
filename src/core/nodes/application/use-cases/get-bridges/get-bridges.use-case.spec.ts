import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetBridgesUseCase } from './get-bridges.use-case';
import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';
import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';

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

const mockRepository: INodesRepository = {
  listBridges: vi.fn(),
  listNodes: vi.fn(),
  claimBridge: vi.fn(),
};

describe('GetBridgesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns bridges from the repository', async () => {
    vi.mocked(mockRepository.listBridges).mockResolvedValue(mockBridges);
    const useCase = new GetBridgesUseCase(mockRepository);

    expect(await useCase.execute()).toEqual(mockBridges);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.listBridges).mockRejectedValue(new Error('Network error'));
    const useCase = new GetBridgesUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
