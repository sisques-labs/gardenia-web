export interface PlantSpecies {
  id: string;
  name: string;
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

export interface Plant {
  id: string;
  name: string;
  plantSpeciesId?: string;
  species?: PlantSpecies;
  imageUrl?: string;
  userId: string;
  spaceId: string;
  qr?: PlantQr;
  createdAt: string;
  updatedAt: string;
}
