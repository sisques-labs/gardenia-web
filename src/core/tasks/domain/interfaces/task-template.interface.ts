import type { TaskBackoffStrategy } from './task-backoff-strategy.enum';

export interface ITaskTemplate {
  id: string;
  spaceId: string;
  name: string;
  defaultPayload: Record<string, unknown>;
  maxRetries: number;
  backoffStrategy: TaskBackoffStrategy;
  createdAt: string;
  updatedAt: string;
}
