import { z } from 'zod';

export const createPlantFromIdentificationSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100, 'nameMax'),
});

export type CreatePlantFromIdentificationFormValues = z.infer<typeof createPlantFromIdentificationSchema>;
