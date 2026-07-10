export interface UpdatePlantInput {
  id: string;
  name?: string;
  gbifSpeciesKey?: number | null;
  speciesScientificName?: string | null;
  imageUrl?: string | null;
  plantingSpotId?: string | null;
}
