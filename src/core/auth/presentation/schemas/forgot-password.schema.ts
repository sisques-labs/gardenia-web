import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
