import type { TaskGqlRaw } from './tasks-find-by-criteria.response';

export interface TaskFindByIdResponse {
  taskFindById: TaskGqlRaw | null;
}
