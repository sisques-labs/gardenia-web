import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export class CreateSpaceUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(name: string): Promise<Space> {
    const space = await this.spacesRepository.create(name);
    const current = useSpacesStore.getState().availableSpaces;
    useSpacesStore.getState().setSpaces([...current, space]);
    useSpacesStore.getState().setActiveSpace(space.id);
    return space;
  }
}
