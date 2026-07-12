import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';
import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';

export class GetBridgesUseCase {
  constructor(private readonly nodesRepository: INodesRepository) {}

  async execute(): Promise<Bridge[]> {
    return this.nodesRepository.listBridges();
  }
}
