import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  username: z.string().min(3, 'usernameMin').max(30, 'usernameMax'),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().max(500, 'bioMax').nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
});

export type UpdateUserProfileFormValues = z.infer<typeof updateUserProfileSchema>;
