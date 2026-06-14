export type PlantingSpotType =
  | 'raised_bed'
  | 'pot'
  | 'container'
  | 'field_section'
  | 'other';

export interface PlantingSpot {
  id: string;
  name: string;
  type: PlantingSpotType;
  description?: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
