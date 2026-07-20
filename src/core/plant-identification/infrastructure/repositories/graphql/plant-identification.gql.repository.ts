import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import { PLANT_IDENTIFICATIONS } from './queries/plant-identifications.query';
import { CREATE_PLANT_FROM_IDENTIFICATION } from './mutations/create-plant-from-identification.mutation';

interface PlantIdentificationsResponse {
  plantIdentifications: { items: PlantIdentification[]; total: number };
}

interface CreatePlantFromIdentificationResponse {
  createPlantFromIdentification: { id: string } | null;
}

export class PlantIdentificationGqlRepository implements IPlantIdentificationsRepository {
  async findByCriteria(
    spaceId: string,
    page: number,
    limit: number,
  ): Promise<{ items: PlantIdentification[]; total: number }> {
    const res = await apolloClient.query<PlantIdentificationsResponse>({
      query: PLANT_IDENTIFICATIONS,
      variables: { input: { spaceId, pagination: { page, perPage: limit } } },
      fetchPolicy: 'network-only',
    });
    const data = res.data?.plantIdentifications;
    return { items: data?.items ?? [], total: data?.total ?? 0 };
  }

  async createPlantFromIdentification(input: {
    identificationId: string;
    name: string;
  }): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<CreatePlantFromIdentificationResponse>({
      mutation: CREATE_PLANT_FROM_IDENTIFICATION,
      variables: { input },
    });
    const id = res.data?.createPlantFromIdentification?.id;
    if (!id) throw new Error('createPlantFromIdentification mutation failed');
    return { id };
  }
}

export const plantIdentificationGqlRepository = new PlantIdentificationGqlRepository();
