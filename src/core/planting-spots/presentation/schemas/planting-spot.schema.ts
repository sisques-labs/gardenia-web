import { z } from 'zod';

export const PLANTING_SPOT_TYPES = [
  'raised_bed',
  'pot',
  'container',
  'field_section',
  'other',
] as const;

export const plantingSpotSchema = z.object({
  name: z.string().min(1),
  type: z.enum(PLANTING_SPOT_TYPES),
  description: z.string().optional(),
});

export type PlantingSpotFormValues = z.infer<typeof plantingSpotSchema>;
