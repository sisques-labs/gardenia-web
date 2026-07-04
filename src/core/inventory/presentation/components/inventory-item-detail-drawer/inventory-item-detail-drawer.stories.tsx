import type { Meta, StoryObj } from "@storybook/react";
import { InventoryItemDetailDrawer } from "./inventory-item-detail-drawer";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { InventoryItem } from "@/core/inventory/domain/types/inventory-item.interface";

const dict = getDictionary("es").inventory;

const mockItem: InventoryItem = {
  id: "i1",
  name: "Sustrato universal",
  itemType: "SUBSTRATE",
  brand: "Compo",
  quantity: 5,
  unit: "KG",
  lowStockThreshold: 1,
  notes: "Guardado en el cobertizo",
  acquiredAt: "2026-03-01",
  expiresAt: "2027-03-01",
  userId: "u1",
  spaceId: "s1",
  createdAt: "2026-01-01",
  updatedAt: "2026-02-01",
};

const meta = {
  title: "Inventory/InventoryItemDetailDrawer",
  component: InventoryItemDetailDrawer,
  tags: ["autodocs"],
  args: { dict, lang: "es", item: mockItem, onClose: () => {} },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InventoryItemDetailDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MissingOptionalFields: Story = {
  args: { item: { ...mockItem, brand: null, notes: null, acquiredAt: null, expiresAt: null } },
};
