import type { Meta, StoryObj } from "@storybook/react";
import { AuthSubmit } from "./auth-submit";

const meta = {
  title: "Auth/AuthSubmit",
  component: AuthSubmit,
  tags: ["autodocs"],
  args: { label: "Iniciar sesión", loadingLabel: "Iniciando sesión...", isPending: false },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthSubmit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { isPending: true },
};
