import { useQuery } from '@tanstack/react-query';
import { GetPlantCareLogsUseCase } from '@/core/care-log/application/use-cases/get-plant-care-logs/get-plant-care-logs.use-case';
import { careLogGqlRepository } from '@/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const getPlantCareLogsUseCase = new GetPlantCareLogsUseCase(careLogGqlRepository);

export function usePlantCareLogs(plantId: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['care-log', spaceId, plantId],
    queryFn: () => getPlantCareLogsUseCase.execute(plantId),
    enabled: !!spaceId && !!plantId,
  });
}
