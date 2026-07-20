import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';

export interface IdentifyPlantInput {
  photos: { file: File; organ: PlantIdentificationOrgan }[];
}
