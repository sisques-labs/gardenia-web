export interface MutationResponseGqlRaw {
  success: boolean;
  message?: string;
  id?: string;
}

export interface CancelTaskResponse {
  cancelTask: MutationResponseGqlRaw;
}
