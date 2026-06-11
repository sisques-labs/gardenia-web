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
      templateId: raw.templateId,
      triggerType: raw.triggerType,
      title: raw.title,
      description: raw.description,
      status: raw.status as TaskStatus,
      payload,
      priority: raw.priority,
      delayMs: raw.delayMs,
      cronExpression: raw.cronExpression,
      isRecurring: raw.isRecurring,
      maxRuns: raw.maxRuns,
      runCount: raw.runCount,
      idempotencyKey: raw.idempotencyKey,
      userId: raw.userId,
      targetType: raw.targetType,
      targetId: raw.targetId,
      validFrom: raw.validFrom,
      validUntil: raw.validUntil,
      scheduledAt: raw.scheduledAt,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      failedAt: raw.failedAt,
      cancelledAt: raw.cancelledAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
