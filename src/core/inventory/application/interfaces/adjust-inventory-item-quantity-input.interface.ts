export interface AdjustInventoryItemQuantityInput {
  id: string;
  /** Signed adjustment. Negative consumes, positive restocks. */
  delta: number;
  reason: string;
}
