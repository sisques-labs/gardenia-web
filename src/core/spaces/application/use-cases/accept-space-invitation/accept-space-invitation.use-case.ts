import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export class AcceptSpaceInvitationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(code: string): Promise<Space | null> {
    const beforeIds = new Set(
      useSpacesStore.getState().availableSpaces.map((space) => space.id),
    );

    await this.spacesRepository.acceptInvitation(code);

    const spaces = await this.spacesRepository.listByUser();
    useSpacesStore.getState().setSpaces(spaces);

    const joined = spaces.find((space) => !beforeIds.has(space.id)) ?? null;
    if (joined) {
      useSpacesStore.getState().setActiveSpace(joined.id);
    }

    return joined;
  }
}
