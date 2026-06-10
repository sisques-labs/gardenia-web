export interface TaskTemplateDeleteGqlRaw {
  success: boolean;
  message?: string;
}

export interface TaskTemplateDeleteResponse {
  deleteTaskTemplate: TaskTemplateDeleteGqlRaw;
}
