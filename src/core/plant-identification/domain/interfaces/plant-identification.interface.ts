import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';

export interface PlantIdentificationPhoto {
  url: string;
  organ: PlantIdentificationOrgan;
}

export interface PlantIdentificationCandidate {
  scientificName: string;
  commonNames: string[];
  score: number;
}

export interface PlantIdentification {
  id: string;
  status: 'resolved' | 'no_match';
  resolved: { gbifKey: number; scientificName: string } | null;
  candidates: PlantIdentificationCandidate[];
  photos: PlantIdentificationPhoto[];
  convertedToPlantId: string | null;
  createdAt: string;
}
