import { z } from 'zod';

export const updateGeolocationSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  environment: z.enum(['INDOOR', 'OUTDOOR', 'MIXED']).nullable(),
});

export type UpdateGeolocationFormValues = z.infer<typeof updateGeolocationSchema>;
