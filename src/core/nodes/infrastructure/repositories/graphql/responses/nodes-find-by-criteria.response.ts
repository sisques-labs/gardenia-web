import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

export interface NodesFindByCriteriaResponse {
  nodesFindByCriteria: {
    items: Node[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
