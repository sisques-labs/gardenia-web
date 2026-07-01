import type { Meta, StoryObj } from "@storybook/react";
import { MiniMapSkeleton } from "./mini-map-section-skeleton";

const meta = {
  title: "Home/MiniMapSkeleton",
  component: MiniMapSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof MiniMapSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
