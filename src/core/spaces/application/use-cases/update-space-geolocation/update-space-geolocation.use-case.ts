import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { UpdateGeolocationInput } from '@/core/spaces/application/interfaces/update-geolocation-input.interface';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

export class UpdateSpaceGeolocationUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(input: UpdateGeolocationInput): Promise<void> {
    return this.spacesRepository.updateGeolocation(input);
  }
}

export const updateSpaceGeolocationUseCase = new UpdateSpaceGeolocationUseCase(spacesGqlRepository);
