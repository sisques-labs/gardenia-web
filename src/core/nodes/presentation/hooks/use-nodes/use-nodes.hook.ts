import { useQuery } from '@tanstack/react-query';
import { GetNodesUseCase } from '@/core/nodes/application/use-cases/get-nodes/get-nodes.use-case';
import { nodesGqlRepository } from '@/core/nodes/infrastructure/repositories/graphql/nodes.gql.repository';

const getNodesUseCase = new GetNodesUseCase(nodesGqlRepository);

export function useNodes(spaceId: string | null) {
  return useQuery({
    queryKey: ['nodes', spaceId],
    queryFn: () => getNodesUseCase.execute(),
    enabled: !!spaceId,
  });
}
