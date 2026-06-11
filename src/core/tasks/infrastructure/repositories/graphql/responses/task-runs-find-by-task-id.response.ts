export interface TaskRunGqlRaw {
  id: string;
  taskId: string;
  attempt: number;
  status: string;
  progress: number;
  error?: string | null;
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
}

export interface TaskRunsFindByTaskIdResponse {
  taskRunsFindByTaskId: TaskRunGqlRaw[];
}
