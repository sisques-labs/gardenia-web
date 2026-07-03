import { gql } from '@apollo/client';

export const INVENTORY_ITEMS_DELETE_BULK = gql`
  mutation InventoryItemsDeleteBulk($input: DeleteInventoryItemsBulkInput!) {
    inventoryItemsDeleteBulk(input: $input) {
      deletedIds
      notFoundIds
      deletedCount
      requestedCount
    }
  }
`;
