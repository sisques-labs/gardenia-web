import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';

export interface TaskGqlRaw {
  id: string;
  spaceId: string;
  templateId?: string;
  name: string;
  status: string;
  payload: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksFindByCriteriaResponse {
  tasksFindByCriteria: Paginated<TaskGqlRaw>;
}
