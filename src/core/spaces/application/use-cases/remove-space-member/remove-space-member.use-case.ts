import type { ISpacesRepository, MemberInput } from '@/core/spaces/application/ports/spaces.repository.port';

export class RemoveSpaceMemberUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: MemberInput): Promise<void> {
    return this.spacesRepository.removeMember(input);
  }
}
