import { z } from 'zod';

export const createPlantSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100, 'nameMax'),
  imageUrl: z.string().optional(),
});

export type CreatePlantFormValues = z.infer<typeof createPlantSchema>;
