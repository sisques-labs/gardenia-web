import type { Meta, StoryObj } from "@storybook/react";
import { HarvestPaceSkeleton } from "./harvest-pace-section-skeleton";

const meta = {
  title: "Home/HarvestPaceSkeleton",
  component: HarvestPaceSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof HarvestPaceSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
