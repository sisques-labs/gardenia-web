import { useQuery } from '@tanstack/react-query';
import { GetSpaceDetailUseCase } from '@/core/spaces/application/use-cases/get-space-detail/get-space-detail.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const getSpaceDetailUseCase = new GetSpaceDetailUseCase(spacesGqlRepository);

export function useSpaceDetail(spaceId: string | null) {
  return useQuery({
    queryKey: ['space-detail', spaceId],
    queryFn: () => getSpaceDetailUseCase.execute(spaceId!),
    enabled: !!spaceId,
  });
}
