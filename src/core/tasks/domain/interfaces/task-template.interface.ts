export interface ITaskTemplate {
  id: string;
  name: string;
  description?: string | null;
  taskTitle?: string | null;
  taskDescription?: string | null;
  handlerKey?: string | null;
  defaultPriority: number;
  defaultRetryCount: number;
  defaultBackoffStrategy: string;
  defaultTimeoutMs: number;
  maxConcurrency: number;
  defaultCronExpression?: string | null;
  defaultIsRecurring: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
