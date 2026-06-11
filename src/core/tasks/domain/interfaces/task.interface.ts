import type { TaskStatus } from './task-status.enum';

export interface ITask {
  id: string;
  templateId?: string | null;
  triggerType: string;
  title?: string | null;
  description?: string | null;
  status: TaskStatus;
  payload: Record<string, unknown>;
  priority: number;
  delayMs?: number | null;
  cronExpression?: string | null;
  isRecurring: boolean;
  maxRuns?: number | null;
  runCount: number;
  idempotencyKey?: string | null;
  userId: string;
  targetType?: string | null;
  targetId?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
