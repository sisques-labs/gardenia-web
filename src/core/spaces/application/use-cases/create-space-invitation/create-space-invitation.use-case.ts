import type { ISpacesRepository, CreateInvitationInput } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceInvitation } from '@/core/spaces/domain/interfaces/space-invitation.interface';

export class CreateSpaceInvitationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: CreateInvitationInput): Promise<SpaceInvitation> {
    return this.spacesRepository.createInvitation(input);
  }
}
