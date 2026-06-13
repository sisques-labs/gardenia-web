import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export class ListSpacesUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(): Promise<Space[]> {
    return this.spacesRepository.listByUser();
  }
}
