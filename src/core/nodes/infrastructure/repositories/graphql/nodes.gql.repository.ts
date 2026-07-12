import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { INodesRepository } from '@/core/nodes/application/ports/nodes.repository.port';
import type { Bridge } from '@/core/nodes/domain/interfaces/bridge.interface';
import type { Node } from '@/core/nodes/domain/interfaces/node.interface';
import { BRIDGES_FIND_BY_CRITERIA } from './queries/bridges-find-by-criteria.query';
import { NODES_FIND_BY_CRITERIA } from './queries/nodes-find-by-criteria.query';
import { BRIDGE_CLAIM } from './mutations/bridge-claim.mutation';
import type { BridgesFindByCriteriaResponse } from './responses/bridges-find-by-criteria.response';
import type { NodesFindByCriteriaResponse } from './responses/nodes-find-by-criteria.response';
import type { BridgeClaimResponse } from './responses/bridge-claim.response';

export class NodesGqlRepository implements INodesRepository {
  async listBridges(): Promise<Bridge[]> {
    const res = await apolloClient.query<BridgesFindByCriteriaResponse>({
      query: BRIDGES_FIND_BY_CRITERIA,
      fetchPolicy: 'network-only',
    });
    return res.data?.bridgesFindByCriteria?.items ?? [];
  }

  async listNodes(): Promise<Node[]> {
    const res = await apolloClient.query<NodesFindByCriteriaResponse>({
      query: NODES_FIND_BY_CRITERIA,
      fetchPolicy: 'network-only',
    });
    return res.data?.nodesFindByCriteria?.items ?? [];
  }

  async claimBridge(bridgeId: string, pairingCode: string): Promise<void> {
    const res = await apolloClient.mutate<BridgeClaimResponse>({
      mutation: BRIDGE_CLAIM,
      variables: { input: { bridgeId, pairingCode } },
    });
    if (!res.data?.bridgeClaim?.success) {
      throw new Error(res.data?.bridgeClaim?.message ?? 'bridgeClaim mutation failed');
    }
  }
}

export const nodesGqlRepository = new NodesGqlRepository();
