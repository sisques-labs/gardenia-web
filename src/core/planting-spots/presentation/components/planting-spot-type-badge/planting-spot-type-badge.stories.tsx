import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotTypeBadge } from "./planting-spot-type-badge";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").plantingSpots.types;

const meta = {
  title: "PlantingSpots/PlantingSpotTypeBadge",
  component: PlantingSpotTypeBadge,
  tags: ["autodocs"],
  args: { dict, type: "RAISED_BED" },
} satisfies Meta<typeof PlantingSpotTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RaisedBed: Story = {};
export const Pot: Story = { args: { type: "POT" } };
export const Container: Story = { args: { type: "CONTAINER" } };
