import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { http } from '@/shared/infrastructure/http/axios.client';
import type { IPlantIdentificationsRepository } from '@/core/plant-identification/application/ports/plant-identifications.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import { PLANT_IDENTIFICATIONS } from './queries/plant-identifications.query';
import { CREATE_PLANT_FROM_IDENTIFICATION } from './mutations/create-plant-from-identification.mutation';

interface PlantIdentificationsResponse {
  plantIdentifications: { items: PlantIdentification[]; total: number };
}

interface CreatePlantFromIdentificationResponse {
  createPlantFromIdentification: { id: string } | null;
}

// The `POST /api/plant-identifications` REST response shape mirrors
// PlantIdentification but never includes convertedToPlantId — a freshly
// created identification cannot have been converted yet.
type IdentifyHttpResponse = Omit<PlantIdentification, 'convertedToPlantId'>;

/**
 * ADR-002 (openspec/changes/plant-identification-web/design.md): this
 * repository deliberately mixes transports — `identify()` posts multipart
 * form data via the shared axios `http` client (the api has no GraphQL
 * upload), while `findByCriteria()` and `createPlantFromIdentification()`
 * go through Apollo like the rest of this app's GraphQL traffic. This is a
 * scoped exception, not a pattern to replicate in other GQL repositories.
 */
export class PlantIdentificationGqlRepository implements IPlantIdentificationsRepository {
  async identify(input: {
    photos: { file: File; organ: PlantIdentificationOrgan }[];
  }): Promise<PlantIdentification> {
    const formData = new FormData();
    const organs: PlantIdentificationOrgan[] = [];
    for (const { file, organ } of input.photos) {
      formData.append('photos', file);
      organs.push(organ);
    }
    formData.append('organs', JSON.stringify(organs));

    const res = await http.post<IdentifyHttpResponse>('/plant-identifications', formData);
    return { ...res.data, convertedToPlantId: null };
  }

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
