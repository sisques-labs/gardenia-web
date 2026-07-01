import type { Meta, StoryObj } from "@storybook/react";
import { AuthSocial } from "./auth-social";

const meta = {
  title: "Auth/AuthSocial",
  component: AuthSocial,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthSocial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
