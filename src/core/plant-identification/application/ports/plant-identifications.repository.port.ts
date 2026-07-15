import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';

/**
 * ADR-002 (openspec/changes/plant-identification-web/design.md): a single
 * port/repository pair backs both transports — `identify()` is REST/axios
 * (multipart upload), while `findByCriteria()` and
 * `createPlantFromIdentification()` are GraphQL/Apollo like the rest of this
 * app's read/write traffic. This is a deliberate, scoped exception to the
 * "one repository, one transport" default, not a new pattern to replicate
 * elsewhere.
 */
export interface IPlantIdentificationsRepository {
  identify(input: {
    photos: { file: File; organ: PlantIdentificationOrgan }[];
  }): Promise<PlantIdentification>;

  findByCriteria(
    spaceId: string,
    page: number,
    limit: number,
  ): Promise<{ items: PlantIdentification[]; total: number }>;

  createPlantFromIdentification(input: {
    identificationId: string;
    name: string;
  }): Promise<CreatedEntity>;
}
