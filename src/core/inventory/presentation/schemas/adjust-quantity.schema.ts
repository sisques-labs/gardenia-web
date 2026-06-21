import { z } from 'zod';

export const adjustQuantitySchema = z.object({
  delta: z.coerce.number().refine((n) => n !== 0, { message: 'nonzero' }),
  reason: z.string().min(1).max(500),
});

export type AdjustQuantityFormValues = z.infer<typeof adjustQuantitySchema>;
