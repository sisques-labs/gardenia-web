import { useQuery } from '@tanstack/react-query';
import { GetBridgesUseCase } from '@/core/nodes/application/use-cases/get-bridges/get-bridges.use-case';
import { nodesGqlRepository } from '@/core/nodes/infrastructure/repositories/graphql/nodes.gql.repository';

const getBridgesUseCase = new GetBridgesUseCase(nodesGqlRepository);

export function useBridges(spaceId: string | null) {
  return useQuery({
    queryKey: ['bridges', spaceId],
    queryFn: () => getBridgesUseCase.execute(),
    enabled: !!spaceId,
  });
}
