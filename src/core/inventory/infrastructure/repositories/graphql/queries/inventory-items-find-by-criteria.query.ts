import { gql } from '@apollo/client';

export const INVENTORY_ITEMS_FIND_BY_CRITERIA = gql`
  query InventoryItemsFindByCriteria($input: InventoryItemCriteriaInput) {
    inventoryItemsFindByCriteria(input: $input) {
      items {
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
  }
`;
