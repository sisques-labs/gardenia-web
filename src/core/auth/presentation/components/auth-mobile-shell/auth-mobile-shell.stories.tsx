import type { Meta, StoryObj } from "@storybook/react";
import { AuthMobileShell } from "./auth-mobile-shell";

const meta = {
  title: "Auth/AuthMobileShell",
  component: AuthMobileShell,
  tags: ["autodocs"],
  args: { children: <p>Formulario de ejemplo</p> },
} satisfies Meta<typeof AuthMobileShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
