import { gql } from '@apollo/client';

export const INVENTORY_ITEM_FIND_BY_ID = gql`
  query InventoryItemFindById($input: InventoryItemFindByIdInput!) {
    inventoryItemFindById(input: $input) {
      id
      itemType
      name
      brand
      notes
      quantity
      unit
      lowStockThreshold
      acquiredAt
      expiresAt
      userId
      spaceId
      createdAt
      updatedAt
    }
  }
`;
