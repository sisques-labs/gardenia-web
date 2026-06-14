import { z } from 'zod';

export const createInvitationSchema = z.object({
  role: z.enum(['owner', 'member']),
  expiresAt: z.string().optional().transform((v) => (v === '' ? undefined : v)),
});

export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>;
