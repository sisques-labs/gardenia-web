import { z } from 'zod';

export const createInvitationSchema = z.object({
  role: z.enum(['owner', 'member']),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>;
