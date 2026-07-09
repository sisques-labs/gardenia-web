import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('emailInvalid'),
  password: z.string().min(6, 'passwordMin'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'passwordsMismatch',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
