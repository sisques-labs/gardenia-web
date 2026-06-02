import { useQuery } from '@tanstack/react-query';
import { GetPlantsUseCase } from '@/core/plants/application/use-cases/get-plants/get-plants.use-case';
import { PlantsHttpRepository } from '@/core/plants/infrastructure/repositories/plants-http.repository';

const plantsUseCase = new GetPlantsUseCase(new PlantsHttpRepository());

export function usePlants(spaceId: string | null) {
  return useQuery({
    queryKey: ['plants', spaceId],
    queryFn: () => plantsUseCase.execute(),
    enabled: !!spaceId,
  });
}
