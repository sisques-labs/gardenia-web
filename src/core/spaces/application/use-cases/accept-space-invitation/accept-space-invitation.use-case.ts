import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export class AcceptSpaceInvitationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(code: string): Promise<string> {
    const spaceId = await this.spacesRepository.acceptInvitation(code);
    useSpacesStore.getState().setActiveSpace(spaceId);

    void this.spacesRepository
      .listByUser()
      .then((spaces) => useSpacesStore.getState().setSpaces(spaces))
      .catch(() => undefined);

    return spaceId;
  }
}
