import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('emailInvalid'),
  password: z.string().min(6, 'passwordMin'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
