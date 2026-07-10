import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { GbifSpeciesSuggestion } from '@/core/plants/domain/interfaces/gbif-species-suggestion.interface';

export class SearchSpeciesUseCase {
  constructor(private readonly plantsRepository: IPlantsRepository) {}

  async execute(name: string, limit?: number): Promise<GbifSpeciesSuggestion[]> {
    return this.plantsRepository.searchSpecies(name, limit);
  }
}
