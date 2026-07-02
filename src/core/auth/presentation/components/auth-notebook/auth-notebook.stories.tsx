import type { Meta, StoryObj } from "@storybook/react";
import { AuthNotebook } from "./auth-notebook";

const meta = {
  title: "Auth/AuthNotebook",
  component: AuthNotebook,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthNotebook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
