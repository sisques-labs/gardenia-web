import { useQuery } from '@tanstack/react-query';
import { GetPlantUseCase } from '@/core/plants/application/use-cases/get-plant/get-plant.use-case';
import { PlantsHttpRepository } from '@/core/plants/infrastructure/repositories/plants-http.repository';

const plantUseCase = new GetPlantUseCase(new PlantsHttpRepository());

export function usePlant(spaceId: string | null, id: string) {
  return useQuery({
    queryKey: ['plant', spaceId, id],
    queryFn: () => plantUseCase.execute(id),
    enabled: !!spaceId && !!id,
  });
}
