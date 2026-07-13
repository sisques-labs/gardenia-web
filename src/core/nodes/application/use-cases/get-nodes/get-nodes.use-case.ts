import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

export class GetNodesUseCase {
  constructor(private readonly nodesRepository: INodesRepository) {}

  async execute(): Promise<Node[]> {
    return this.nodesRepository.listNodes();
  }
}
