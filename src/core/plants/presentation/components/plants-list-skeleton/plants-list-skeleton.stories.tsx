import type { Meta, StoryObj } from "@storybook/react";
import { PlantsListSkeleton } from "./plants-list-skeleton";

const meta = {
  title: "Plants/PlantsListSkeleton",
  component: PlantsListSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantsListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
