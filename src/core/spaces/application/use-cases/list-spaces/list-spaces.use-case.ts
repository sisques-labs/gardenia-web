import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export class ListSpacesUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(): Promise<Space[]> {
    const spaces = await this.spacesRepository.listByUser();
    useSpacesStore.getState().setSpaces(spaces);
    return spaces;
  }
}
