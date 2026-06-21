import { gql } from '@apollo/client';

export const INVENTORY_ITEM_UPDATE = gql`
  mutation InventoryItemUpdate($input: UpdateInventoryItemInput!) {
    inventoryItemUpdate(input: $input) {
      id
      success
      message
    }
  }
`;
