import { z } from 'zod';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

export const taskTemplateSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100, 'nameMax'),
  description: z.string().max(500, 'descriptionMax').optional().or(z.literal('')),
  taskTitle: z.string().max(200, 'taskTitleMax').optional().or(z.literal('')),
  taskDescription: z.string().max(1000, 'taskDescriptionMax').optional().or(z.literal('')),
  handlerKey: z.string().max(200, 'handlerKeyMax').optional().or(z.literal('')),
  defaultPriority: z
    .number({ invalid_type_error: 'priorityInvalid' })
    .int('priorityInvalid')
    .min(1, 'priorityMin')
    .max(10, 'priorityMax')
    .default(5),
  defaultRetryCount: z
    .number({ invalid_type_error: 'maxRetriesInvalid' })
    .int('maxRetriesInvalid')
    .min(0, 'maxRetriesMin')
    .max(10, 'maxRetriesMax')
    .default(3),
  defaultBackoffStrategy: z.nativeEnum(TaskBackoffStrategy, {
    errorMap: () => ({ message: 'backoffStrategyInvalid' }),
  }).default(TaskBackoffStrategy.Exponential),
  defaultTimeoutMs: z
    .number({ invalid_type_error: 'timeoutInvalid' })
    .int('timeoutInvalid')
    .min(1000, 'timeoutMin')
    .default(30000),
  maxConcurrency: z
    .number({ invalid_type_error: 'maxConcurrencyInvalid' })
    .int('maxConcurrencyInvalid')
    .min(1, 'maxConcurrencyMin')
    .max(100, 'maxConcurrencyMax')
    .default(1),
  defaultCronExpression: z.string().max(100, 'cronMax').optional().or(z.literal('')),
  defaultIsRecurring: z.boolean().default(false),
});

export type TaskTemplateFormInput = z.input<typeof taskTemplateSchema>;
export type TaskTemplateFormValues = z.output<typeof taskTemplateSchema>;
