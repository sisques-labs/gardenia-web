import type { Meta, StoryObj } from "@storybook/react";
import { HarvestRow } from "./harvest-row";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { Harvest } from "@/core/harvests/domain/types/harvest.interface";

const dict = getDictionary("es").harvests;

const mockHarvest: Harvest = {
  id: "h1", cropType: "Tomate", quantity: 3.5, unit: "KG", harvestedAt: "2026-06-20", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "",
};

const meta = {
  title: "Harvests/HarvestRow",
  component: HarvestRow,
  tags: ["autodocs"],
  args: { harvest: mockHarvest, dict, onDelete: () => {}, onEdit: () => {} },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HarvestRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
