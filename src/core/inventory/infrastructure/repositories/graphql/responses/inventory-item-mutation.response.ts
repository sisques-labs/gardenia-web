interface MutationResult {
  id: string;
  success: boolean;
  message: string;
}

export interface InventoryItemCreateResponse {
  inventoryItemCreate: MutationResult;
}

export interface InventoryItemUpdateResponse {
  inventoryItemUpdate: MutationResult;
}

export interface InventoryItemAdjustQuantityResponse {
  inventoryItemAdjustQuantity: MutationResult;
}

export interface InventoryItemDeleteResponse {
  inventoryItemDelete: MutationResult;
}
