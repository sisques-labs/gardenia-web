import type { Meta, StoryObj } from "@storybook/react";
import { GrowingNowSkeleton } from "./growing-now-section-skeleton";

const meta = {
  title: "Home/GrowingNowSkeleton",
  component: GrowingNowSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof GrowingNowSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
