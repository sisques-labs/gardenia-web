import { gql } from '@apollo/client';

export const INVENTORY_ITEM_ADJUST_QUANTITY = gql`
  mutation InventoryItemAdjustQuantity($input: AdjustInventoryItemQuantityInput!) {
    inventoryItemAdjustQuantity(input: $input) {
      id
      success
      message
    }
  }
`;
