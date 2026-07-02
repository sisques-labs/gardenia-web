import type { Meta, StoryObj } from "@storybook/react";
import { JournalSkeleton } from "./journal-section-skeleton";

const meta = {
  title: "Home/JournalSkeleton",
  component: JournalSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof JournalSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
