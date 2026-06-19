import { z } from 'zod';

export const updateSpaceSchema = z.object({
  name: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  environment: z.enum(['INDOOR', 'OUTDOOR', 'MIXED']).nullable(),
});

export type UpdateSpaceFormValues = z.infer<typeof updateSpaceSchema>;
