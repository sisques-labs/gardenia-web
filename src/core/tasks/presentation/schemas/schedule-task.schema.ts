import { z } from 'zod';

export const scheduleTaskSchema = z.object({
  templateId: z.string().uuid('templateIdInvalid'),
  name: z.string().min(1, 'nameRequired').max(100, 'nameMax'),
  scheduledAt: z
    .string()
    .min(1, 'scheduledAtRequired')
    .refine((val) => !isNaN(Date.parse(val)), 'scheduledAtInvalid'),
  payload: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'payloadInvalidJson'),
});

export type ScheduleTaskFormValues = z.infer<typeof scheduleTaskSchema>;
