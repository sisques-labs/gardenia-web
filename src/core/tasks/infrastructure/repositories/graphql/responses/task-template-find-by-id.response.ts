import type { TaskTemplateGqlRaw } from './task-templates-find-by-criteria.response';

export interface TaskTemplateFindByIdResponse {
  taskTemplateFindById: TaskTemplateGqlRaw | null;
}
