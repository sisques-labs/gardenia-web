import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email('emailInvalid'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
