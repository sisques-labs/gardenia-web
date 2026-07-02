import type { Meta, StoryObj } from "@storybook/react";
import { AdjustQuantityModal } from "./adjust-quantity-modal";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { InventoryItem } from "@/core/inventory/domain/types/inventory-item.interface";

const dict = getDictionary("es").inventory;

const mockItem: InventoryItem = {
  id: "i1", name: "Sustrato universal", itemType: "SUBSTRATE", brand: "Compo", quantity: 5, unit: "KG", lowStockThreshold: 1, notes: null, acquiredAt: null, expiresAt: null, userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "",
};

const meta = {
  title: "Inventory/AdjustQuantityModal",
  component: AdjustQuantityModal,
  tags: ["autodocs"],
  args: { dict, item: mockItem, onClose: () => {} },
} satisfies Meta<typeof AdjustQuantityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
