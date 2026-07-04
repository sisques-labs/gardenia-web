export interface PlantSpecies {
  id: string;
  scientificName: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlantQr {
  id: string;
  spaceId: string;
  targetUrl: string;
  generation: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlantPlantingSpot {
  id: string;
  name: string;
  type: string;
}

export interface Plant {
  id: string;
  name: string;
  plantSpeciesId?: string;
  species?: PlantSpecies;
  imageUrl?: string;
  userId: string;
  spaceId: string;
  qr?: PlantQr;
  plantingSpotId?: string;
  plantingSpot?: PlantPlantingSpot;
  createdAt: string;
  updatedAt: string;
}
