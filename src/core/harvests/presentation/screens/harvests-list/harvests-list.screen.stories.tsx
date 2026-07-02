import type { Meta, StoryObj } from "@storybook/react";
import { HarvestsListScreen } from "./harvests-list.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { Harvest } from "@/core/harvests/domain/types/harvest.interface";

const dict = getDictionary("es").harvests;

const mockHarvests: Harvest[] = [
  { id: "h1", cropType: "Tomate", quantity: 3.5, unit: "KG", harvestedAt: "2026-06-20", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
  { id: "h2", cropType: "Lechuga", quantity: 6, unit: "PIECES", harvestedAt: "2026-06-18", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
];

const meta = {
  title: "Screens/HarvestsList",
  component: HarvestsListScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HarvestsListScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHarvests: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["harvests"], mockHarvests))],
};

export const Empty: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["harvests"], []))],
};

export const Loading: Story = {
  decorators: [withQueryClient()],
};
