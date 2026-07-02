import type { Meta, StoryObj } from "@storybook/react";
import { InventoryFilters } from "./inventory-filters";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").inventory;

const meta = {
  title: "Inventory/InventoryFilters",
  component: InventoryFilters,
  tags: ["autodocs"],
  args: {
    dict,
    filters: { query: "", type: "ALL", lowStockOnly: false, expiringSoonOnly: false },
    onQueryChange: () => {},
    onTypeChange: () => {},
    onToggleLowStock: () => {},
    onToggleExpiringSoon: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof InventoryFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    filters: { query: "sustrato", type: "SUBSTRATE", lowStockOnly: true, expiringSoonOnly: false },
  },
};
