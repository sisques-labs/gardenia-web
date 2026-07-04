import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { PlantListCriteria } from '@/core/plants/application/interfaces/plant-list-criteria.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export class GetPlantsUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(criteria?: PlantListCriteria): Promise<PaginatedResult<Plant>> {
    return this.plantsRepository.list(criteria);
  }
}
