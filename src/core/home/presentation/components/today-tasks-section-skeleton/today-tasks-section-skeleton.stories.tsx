import type { Meta, StoryObj } from "@storybook/react";
import { TodayTasksSkeleton } from "./today-tasks-section-skeleton";

const meta = {
  title: "Home/TodayTasksSkeleton",
  component: TodayTasksSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof TodayTasksSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
