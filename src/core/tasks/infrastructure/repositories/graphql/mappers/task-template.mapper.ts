import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import type { TaskTemplateGqlRaw } from '../responses/task-templates-find-by-criteria.response';

export class TaskTemplateMapper {
  static toTaskTemplate(raw: TaskTemplateGqlRaw): ITaskTemplate {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      taskTitle: raw.taskTitle,
      taskDescription: raw.taskDescription,
      handlerKey: raw.handlerKey,
      defaultPriority: raw.defaultPriority,
      defaultRetryCount: raw.defaultRetryCount,
      defaultBackoffStrategy: raw.defaultBackoffStrategy,
      defaultTimeoutMs: raw.defaultTimeoutMs,
      maxConcurrency: raw.maxConcurrency,
      defaultCronExpression: raw.defaultCronExpression,
      defaultIsRecurring: raw.defaultIsRecurring,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
