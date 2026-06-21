import { gql } from '@apollo/client';

export const INVENTORY_ITEM_DELETE = gql`
  mutation InventoryItemDelete($id: String!) {
    inventoryItemDelete(id: $id) {
      id
      success
      message
    }
  }
`;
