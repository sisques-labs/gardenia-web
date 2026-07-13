import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';

export interface INodesRepository {
  listBridges(): Promise<Bridge[]>;
  listNodes(): Promise<Node[]>;
  claimBridge(bridgeId: string, pairingCode: string): Promise<void>;
}
