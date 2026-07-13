import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';

export interface BridgesFindByCriteriaResponse {
  bridgesFindByCriteria: {
    items: Bridge[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
