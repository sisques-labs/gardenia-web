import type { Paginated } from '@/core/tasks/application/interfaces/pagination.interface';

export interface TaskTemplateGqlRaw {
  id: string;
  spaceId: string;
  name: string;
  defaultPayload: string;
  maxRetries: number;
  backoffStrategy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplatesFindByCriteriaResponse {
  taskTemplatesFindByCriteria: Paginated<TaskTemplateGqlRaw>;
}
