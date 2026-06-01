import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().min(3, 'nameMin').max(50, 'nameMax'),
});

export type CreateSpaceFormValues = z.infer<typeof createSpaceSchema>;
