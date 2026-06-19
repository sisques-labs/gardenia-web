import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { UpdateSpaceInput } from '@/core/spaces/application/interfaces/update-space-input.interface';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

export class UpdateSpaceGeolocationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: UpdateSpaceInput): Promise<void> {
    return this.spacesRepository.update(input);
  }
}

export const updateSpaceGeolocationUseCase = new UpdateSpaceGeolocationUseCase(spacesGqlRepository);
