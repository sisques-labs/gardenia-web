import type { ITask } from '@/core/tasks/domain/interfaces/task.interface';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';
import type { TaskGqlRaw } from '../responses/tasks-find-by-criteria.response';

export class TaskMapper {
  static toTask(raw: TaskGqlRaw): ITask {
    let payload: Record<string, unknown> = {};
    if (raw.payload) {
      try {
        const parsed = JSON.parse(raw.payload);
        payload = parsed ?? {};
      } catch {
        throw new Error(`TaskMapper: invalid JSON payload for task ${raw.id}`);
      }
    }
    return {
      id: raw.id,
      spaceId: raw.spaceId,
      templateId: raw.templateId,
      name: raw.name,
      status: raw.status as TaskStatus,
      payload,
      scheduledAt: raw.scheduledAt,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
