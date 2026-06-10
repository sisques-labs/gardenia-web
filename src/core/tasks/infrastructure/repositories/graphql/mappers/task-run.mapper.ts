import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';
import type { TaskRunGqlRaw } from '../responses/task-runs-find-by-task-id.response';

export class TaskRunMapper {
  static toTaskRun(raw: TaskRunGqlRaw): ITaskRun {
    let output: Record<string, unknown> = {};
    if (raw.output) {
      try {
        const parsed = JSON.parse(raw.output);
        output = parsed ?? {};
      } catch {
        output = {};
      }
    }
    return {
      id: raw.id,
      taskId: raw.taskId,
      status: raw.status as TaskRunStatus,
      output,
      error: raw.error,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
