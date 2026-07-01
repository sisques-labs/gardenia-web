import { z } from 'zod';
import { CARE_SCHEDULE_ACTIVITY_TYPES, CARE_SCHEDULE_UNITS } from '@/core/care-schedule/domain/types/care-schedule.interface';

export const careScheduleSchema = z.object({
  plantId: z.string().min(1),
  activityType: z.enum(CARE_SCHEDULE_ACTIVITY_TYPES),
  isRecurring: z.boolean(),
  intervalDays: z.coerce.number().int().min(1).optional(),
  quantity: z.coerce.number().min(0.001).optional(),
  unit: z.enum(CARE_SCHEDULE_UNITS).optional(),
  notes: z.string().max(2000).optional(),
});

export type CareScheduleFormValues = z.infer<typeof careScheduleSchema>;
