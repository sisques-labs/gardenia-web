import { z } from 'zod';

export const scheduleTaskSchema = z.object({
  templateId: z.string().uuid('templateIdInvalid'),
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
