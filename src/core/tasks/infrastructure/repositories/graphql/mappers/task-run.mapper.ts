import type { ITaskRun } from '@/core/tasks/domain/interfaces/task-run.interface';
import { TaskRunStatus } from '@/core/tasks/domain/interfaces/task-run-status.enum';
import type { TaskRunGqlRaw } from '../responses/task-runs-find-by-task-id.response';

export class TaskRunMapper {
  static toTaskRun(raw: TaskRunGqlRaw): ITaskRun {
    return {
      id: raw.id,
      taskId: raw.taskId,
      attempt: raw.attempt,
      status: raw.status as TaskRunStatus,
      progress: raw.progress,
      error: raw.error,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      createdAt: raw.createdAt,
    };
  }
}
