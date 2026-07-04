import type { Meta, StoryObj } from "@storybook/react";
import { InventoryTable } from "./inventory-table";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { InventoryItem } from "@/core/inventory/domain/types/inventory-item.interface";

const dict = getDictionary("es").inventory;

const mockItems: InventoryItem[] = [
  { id: "i1", name: "Sustrato universal", itemType: "SUBSTRATE", brand: "Compo", quantity: 5, unit: "KG", lowStockThreshold: 1, notes: null, acquiredAt: null, expiresAt: null, userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
  { id: "i2", name: "Fertilizante NPK", itemType: "FERTILIZER", brand: null, quantity: 0.2, unit: "L", lowStockThreshold: 0.5, notes: null, acquiredAt: null, expiresAt: "2026-08-01", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
];

const meta = {
  title: "Inventory/InventoryTable",
  component: InventoryTable,
  tags: ["autodocs"],
  args: { items: mockItems, dict, onViewDetail: () => {}, onEdit: () => {}, onAdjust: () => {}, onDelete: () => {} },
  parameters: { layout: "padded" },
} satisfies Meta<typeof InventoryTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { items: [] },
};
