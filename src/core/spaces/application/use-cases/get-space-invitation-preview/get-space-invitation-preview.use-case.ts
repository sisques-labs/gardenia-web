import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceInvitationPreview } from '@/core/spaces/domain/interfaces/space-invitation-preview.interface';

export class GetSpaceInvitationPreviewUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(code: string): Promise<SpaceInvitationPreview> {
    return this.spacesRepository.getInvitationPreview(code);
  }
}
