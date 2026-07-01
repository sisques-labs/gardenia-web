import type { Meta, StoryObj } from "@storybook/react";
import { PlantDetailSkeleton } from "./plant-detail-skeleton";

const meta = {
  title: "Plants/PlantDetailSkeleton",
  component: PlantDetailSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantDetailSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
