import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';

export class GetSpaceDetailUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(spaceId: string): Promise<SpaceDetail> {
    return this.spacesRepository.findById(spaceId);
  }
}
