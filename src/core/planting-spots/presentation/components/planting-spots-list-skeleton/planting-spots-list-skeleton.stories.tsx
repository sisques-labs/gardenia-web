import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotsListSkeleton } from "./planting-spots-list-skeleton";

const meta = {
  title: "PlantingSpots/PlantingSpotsListSkeleton",
  component: PlantingSpotsListSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantingSpotsListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
