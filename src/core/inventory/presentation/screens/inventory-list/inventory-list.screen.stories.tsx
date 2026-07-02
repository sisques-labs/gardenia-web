import type { Meta, StoryObj } from "@storybook/react";
import { InventoryListScreen } from "./inventory-list.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { InventoryItem } from "@/core/inventory/domain/types/inventory-item.interface";

const dict = getDictionary("es").inventory;

const mockItems: InventoryItem[] = [
  { id: "i1", name: "Sustrato universal", itemType: "SUBSTRATE", brand: "Compo", quantity: 5, unit: "KG", lowStockThreshold: 1, notes: null, acquiredAt: null, expiresAt: null, userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
  { id: "i2", name: "Fertilizante NPK", itemType: "FERTILIZER", brand: null, quantity: 0.2, unit: "L", lowStockThreshold: 0.5, notes: null, acquiredAt: null, expiresAt: "2026-08-01", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
];

const meta = {
  title: "Screens/InventoryList",
  component: InventoryListScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InventoryListScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["inventory"], mockItems))],
};

export const Empty: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["inventory"], []))],
};
