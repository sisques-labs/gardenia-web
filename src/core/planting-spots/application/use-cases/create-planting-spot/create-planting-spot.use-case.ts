import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { CreatePlantingSpotInput } from '@/core/planting-spots/application/interfaces/create-planting-spot-input.interface';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export class CreatePlantingSpotUseCase {
  constructor(private readonly repo: IPlantingSpotsRepository) {}

  async execute(input: CreatePlantingSpotInput): Promise<PlantingSpot> {
    return this.repo.create(input);
  }
}
