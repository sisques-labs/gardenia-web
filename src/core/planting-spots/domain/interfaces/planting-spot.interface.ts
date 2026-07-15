import type { PlantingSpotType } from '../types/planting-spot-type.type';
import type { PlantingSpotStatus } from '../types/planting-spot-status.type';

export interface PlantingSpotQr {
  id: string;
  spaceId: string;
  targetUrl: string;
  generation: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlantInSpot {
  id: string;
  name: string;
  plantSpeciesId?: string | null;
  imageUrl?: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlantingSpot {
  id: string;
  name: string;
  type: PlantingSpotType;
  description?: string | null;
  capacity?: number | null;
  row?: number | null;
  column?: number | null;
  dimensionsWidth?: number | null;
  dimensionsHeight?: number | null;
  dimensionsLength?: number | null;
  soilType?: string | null;
  status: PlantingSpotStatus;
  fallowSince?: string | null;
  qr?: PlantingSpotQr;
  userId: string;
  spaceId: string;
  resolvedPlants: PlantInSpot[];
  createdAt: string;
  updatedAt: string;
}
