import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

export class GetPlantingSpotsUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(page: number, perPage: number): Promise<PaginatedResult<PlantingSpot>> {
    return this.repo.list(page, perPage);
  }
}
