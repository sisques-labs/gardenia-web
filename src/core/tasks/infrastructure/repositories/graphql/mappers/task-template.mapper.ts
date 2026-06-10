import type { ITaskTemplate } from '@/core/tasks/domain/interfaces/task-template.interface';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';
import type { TaskTemplateGqlRaw } from '../responses/task-templates-find-by-criteria.response';

export class TaskTemplateMapper {
  static toTaskTemplate(raw: TaskTemplateGqlRaw): ITaskTemplate {
    let defaultPayload: Record<string, unknown> = {};
    if (raw.defaultPayload) {
      try {
        const parsed = JSON.parse(raw.defaultPayload);
        defaultPayload = parsed ?? {};
      } catch {
        defaultPayload = {};
      }
    }
    return {
      id: raw.id,
      spaceId: raw.spaceId,
      name: raw.name,
      defaultPayload,
      maxRetries: raw.maxRetries,
      backoffStrategy: raw.backoffStrategy as TaskBackoffStrategy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
