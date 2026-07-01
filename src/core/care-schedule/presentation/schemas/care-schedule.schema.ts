import { z } from 'zod';
import { CARE_SCHEDULE_ACTIVITY_TYPES, CARE_SCHEDULE_UNITS } from '@/core/care-schedule/domain/types/care-schedule.interface';

// Empty number inputs arrive as '' from the DOM; without this, z.coerce.number() turns '' into 0,
// which then fails .min(...) and silently blocks submission of these optional fields.
const emptyToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

export const careScheduleSchema = z.object({
  plantId: z.string().min(1),
  activityType: z.enum(CARE_SCHEDULE_ACTIVITY_TYPES),
  isRecurring: z.boolean(),
  intervalDays: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional()),
  quantity: z.preprocess(emptyToUndefined, z.coerce.number().min(0.001).optional()),
  unit: z.enum(CARE_SCHEDULE_UNITS).optional(),
  notes: z.string().max(2000).optional(),
  nextDueAt: z.string().min(1),
});

export type CareScheduleFormValues = z.infer<typeof careScheduleSchema>;
