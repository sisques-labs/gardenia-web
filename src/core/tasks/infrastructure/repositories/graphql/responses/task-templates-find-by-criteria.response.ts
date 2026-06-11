export interface TaskTemplateGqlRaw {
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

export interface TaskTemplatesFindByCriteriaRaw {
  items: TaskTemplateGqlRaw[];
  total: number;
  page: number;
}

export interface TaskTemplatesFindByCriteriaResponse {
  taskTemplateFindByCriteria: TaskTemplatesFindByCriteriaRaw;
}
