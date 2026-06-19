import { z } from 'zod';

export const PLANTING_SPOT_TYPES = [
  'RAISED_BED',
  'POT',
  'CONTAINER',
  'FIELD_SECTION',
  'OTHER',
] as const;

export const plantingSpotSchema = z.object({
  name: z.string().min(1),
  type: z.enum(PLANTING_SPOT_TYPES),
  description: z.string().optional(),
  capacity: z.number().int().min(1).nullable().optional(),
  row: z.number().int().min(1).nullable().optional(),
  column: z.number().int().min(1).nullable().optional(),
  dimensions: z.string().max(100).nullable().optional(),
  soilType: z.string().max(100).nullable().optional(),
});

export type PlantingSpotFormValues = z.infer<typeof plantingSpotSchema>;
