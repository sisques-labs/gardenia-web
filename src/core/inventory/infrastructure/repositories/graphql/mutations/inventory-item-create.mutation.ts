import { gql } from '@apollo/client';

export const INVENTORY_ITEM_CREATE = gql`
  mutation InventoryItemCreate($input: CreateInventoryItemInput!) {
    inventoryItemCreate(input: $input) {
      id
      success
      message
    }
  }
`;
