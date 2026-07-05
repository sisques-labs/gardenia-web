import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotsSummarySkeleton } from "./planting-spots-summary-section-skeleton";

const meta = {
  title: "Home/PlantingSpotsSummarySkeleton",
  component: PlantingSpotsSummarySkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantingSpotsSummarySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
