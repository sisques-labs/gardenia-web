import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotDetailSkeleton } from "./planting-spot-detail-skeleton";

const meta = {
  title: "PlantingSpots/PlantingSpotDetailSkeleton",
  component: PlantingSpotDetailSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantingSpotDetailSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
