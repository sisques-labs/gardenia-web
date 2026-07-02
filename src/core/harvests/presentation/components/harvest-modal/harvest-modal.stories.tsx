import type { Meta, StoryObj } from "@storybook/react";
import { HarvestModal } from "./harvest-modal";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { Harvest } from "@/core/harvests/domain/types/harvest.interface";

const dict = getDictionary("es").harvests;

const mockHarvest: Harvest = {
  id: "h1", cropType: "Tomate", quantity: 3.5, unit: "KG", harvestedAt: "2026-06-20", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "",
};

const meta = {
  title: "Harvests/HarvestModal",
  component: HarvestModal,
  tags: ["autodocs"],
  args: { dict, onClose: () => {} },
} satisfies Meta<typeof HarvestModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: { harvest: mockHarvest },
};
