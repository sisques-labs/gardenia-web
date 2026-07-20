import { http } from '@/shared/infrastructure/http/axios.client';
import type { IPlantIdentificationsHttpRepository } from '@/core/plant-identification/application/ports/plant-identifications-http.repository.port';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';

// The `POST /api/plant-identifications` REST response shape mirrors
// PlantIdentification but never includes convertedToPlantId — a freshly
// created identification cannot have been converted yet.
type IdentifyHttpResponse = Omit<PlantIdentification, 'convertedToPlantId'>;

export class PlantIdentificationHttpRepository implements IPlantIdentificationsHttpRepository {
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
}

export const plantIdentificationHttpRepository = new PlantIdentificationHttpRepository();
