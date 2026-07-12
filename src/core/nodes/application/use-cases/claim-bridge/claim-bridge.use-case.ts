import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';

export class ClaimBridgeUseCase {
  constructor(private readonly nodesRepository: INodesRepository) {}

  async execute(bridgeId: string, pairingCode: string): Promise<void> {
    await this.nodesRepository.claimBridge(bridgeId, pairingCode);
  }
}
