import { z } from 'zod';

export const harvestSchema = z.object({
  cropType: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.enum(['KG', 'G', 'PIECES', 'LITERS', 'ML', 'BUNCHES']),
  harvestedAt: z.string().min(1),
});

export type HarvestFormValues = z.infer<typeof harvestSchema>;
