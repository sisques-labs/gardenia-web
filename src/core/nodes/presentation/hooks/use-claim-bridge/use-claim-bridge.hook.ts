import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClaimBridgeUseCase } from '@/core/nodes/application/use-cases/claim-bridge/claim-bridge.use-case';
import { nodesGqlRepository } from '@/core/nodes/infrastructure/repositories/graphql/nodes.gql.repository';

const claimBridgeUseCase = new ClaimBridgeUseCase(nodesGqlRepository);

export function useClaimBridge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bridgeId, pairingCode }: { bridgeId: string; pairingCode: string }) =>
      claimBridgeUseCase.execute(bridgeId, pairingCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bridges'] });
      void queryClient.invalidateQueries({ queryKey: ['nodes'] });
    },
  });
}
