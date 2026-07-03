import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotStatusBadge } from "./planting-spot-status-badge";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").plantingSpots.statuses;

const meta = {
  title: "PlantingSpots/PlantingSpotStatusBadge",
  component: PlantingSpotStatusBadge,
  tags: ["autodocs"],
  args: { dict, status: "ACTIVE" },
} satisfies Meta<typeof PlantingSpotStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const Fallow: Story = { args: { status: "FALLOW" } };
