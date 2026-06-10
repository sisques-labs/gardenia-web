import { z } from 'zod';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

export const taskTemplateSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100, 'nameMax'),
  defaultPayload: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'defaultPayloadInvalidJson'),
  maxRetries: z
    .number({ invalid_type_error: 'maxRetriesInvalid' })
    .int('maxRetriesInvalid')
    .min(0, 'maxRetriesMin'),
  backoffStrategy: z.nativeEnum(TaskBackoffStrategy, { errorMap: () => ({ message: 'backoffStrategyInvalid' }) }),
});

export type TaskTemplateFormValues = z.infer<typeof taskTemplateSchema>;
