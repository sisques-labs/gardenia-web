import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { MemberInput } from '@/core/spaces/application/interfaces/member-input.interface';

export class RemoveSpaceMemberUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: MemberInput): Promise<void> {
    return this.spacesRepository.removeMember(input);
  }
}
