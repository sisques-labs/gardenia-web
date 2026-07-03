export interface BulkDeleteResult {
  deletedIds: string[];
  notFoundIds: string[];
  deletedCount: number;
  requestedCount: number;
}
