import type { Meta, StoryObj } from "@storybook/react";
import { UserProfileSkeleton } from "./user-profile-skeleton";

const meta = {
  title: "Users/UserProfileSkeleton",
  component: UserProfileSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof UserProfileSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
