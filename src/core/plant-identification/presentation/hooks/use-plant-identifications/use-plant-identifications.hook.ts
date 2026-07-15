import { useQuery } from '@tanstack/react-query';
import { GetPlantIdentificationsUseCase } from '@/core/plant-identification/application/use-cases/get-plant-identifications/get-plant-identifications.use-case';
import { plantIdentificationGqlRepository } from '@/core/plant-identification/infrastructure/repositories/graphql/plant-identification.gql.repository';

const getPlantIdentificationsUseCase = new GetPlantIdentificationsUseCase(plantIdentificationGqlRepository);

const RECENT_LIMIT = 5;

export function usePlantIdentifications(spaceId: string | null) {
  return useQuery({
    queryKey: ['plant-identifications', spaceId],
    queryFn: () => getPlantIdentificationsUseCase.execute(spaceId!, 1, RECENT_LIMIT),
    enabled: !!spaceId,
  });
}
