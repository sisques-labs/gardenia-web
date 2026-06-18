import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

export class GetSpaceWeatherUseCase {
  constructor(private readonly spacesRepository: ISpacesRepository) {}

  async execute(spaceId: string): Promise<SpaceWeather | null> {
    return this.spacesRepository.getSpaceWeather(spaceId);
  }
}

export const getSpaceWeatherUseCase = new GetSpaceWeatherUseCase(spacesGqlRepository);
