import type { Meta, StoryObj } from "@storybook/react";
import { PwStrength } from "./pw-strength";

const meta = {
  title: "Auth/PwStrength",
  component: PwStrength,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PwStrength>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { password: "" } };
export const VeryWeak: Story = { args: { password: "abc" } };
export const Weak: Story = { args: { password: "abcdef" } };
export const Good: Story = { args: { password: "abcDEF123" } };
export const Strong: Story = { args: { password: "abcDEF123!@#" } };
