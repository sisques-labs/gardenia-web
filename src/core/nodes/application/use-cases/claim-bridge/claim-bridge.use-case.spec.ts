import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaimBridgeUseCase } from './claim-bridge.use-case';
import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';

const mockRepository: INodesRepository = {
  listBridges: vi.fn(),
  listNodes: vi.fn(),
  claimBridge: vi.fn(),
};

describe('ClaimBridgeUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards bridgeId and pairingCode to the repository', async () => {
    vi.mocked(mockRepository.claimBridge).mockResolvedValue(undefined);
    const useCase = new ClaimBridgeUseCase(mockRepository);

    await useCase.execute('bridge-1', 'GRDN-4F7K');

    expect(mockRepository.claimBridge).toHaveBeenCalledWith('bridge-1', 'GRDN-4F7K');
  });

  it('propagates repository errors (e.g. wrong pairing code)', async () => {
    vi.mocked(mockRepository.claimBridge).mockRejectedValue(new Error('Invalid pairing code'));
    const useCase = new ClaimBridgeUseCase(mockRepository);

    await expect(useCase.execute('bridge-1', 'WRONG')).rejects.toThrow('Invalid pairing code');
  });
});
