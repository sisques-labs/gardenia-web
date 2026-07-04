export interface UpdatePlantInput {
  id: string;
  name?: string;
  plantSpeciesId?: string | null;
  imageUrl?: string | null;
  plantingSpotId?: string | null;
}
