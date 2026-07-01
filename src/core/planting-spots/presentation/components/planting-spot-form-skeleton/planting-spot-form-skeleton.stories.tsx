import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotFormSkeleton } from "./planting-spot-form-skeleton";

const meta = {
  title: "PlantingSpots/PlantingSpotFormSkeleton",
  component: PlantingSpotFormSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantingSpotFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
