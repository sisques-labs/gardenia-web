import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

export class CreateSpaceUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(name: string): Promise<Space> {
    return this.spacesRepository.create(name);
  }
}
