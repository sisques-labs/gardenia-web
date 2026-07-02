import type { Meta, StoryObj } from "@storybook/react";
import { AuthDivider } from "./auth-divider";

const meta = {
  title: "Auth/AuthDivider",
  component: AuthDivider,
  tags: ["autodocs"],
  args: { label: "o" },
} satisfies Meta<typeof AuthDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
