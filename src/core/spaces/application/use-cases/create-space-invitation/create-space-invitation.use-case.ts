import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { CreateInvitationInput } from '@/core/spaces/application/interfaces/create-invitation-input.interface';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';

export class CreateSpaceInvitationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: CreateInvitationInput): Promise<SpaceInvitation> {
    return this.spacesRepository.createInvitation(input);
  }
}
