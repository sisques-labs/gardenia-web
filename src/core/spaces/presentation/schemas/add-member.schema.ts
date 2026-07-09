import { z } from 'zod';

export const addMemberSchema = z.object({
  targetUserId: z.uuid('Must be a valid UUID'),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
