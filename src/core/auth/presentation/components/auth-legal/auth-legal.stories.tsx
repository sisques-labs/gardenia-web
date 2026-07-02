import type { Meta, StoryObj } from "@storybook/react";
import { AuthLegal } from "./auth-legal";

const meta = {
  title: "Auth/AuthLegal",
  component: AuthLegal,
  tags: ["autodocs"],
  args: { children: "Al registrarte aceptas los Términos y la Política de privacidad." },
} satisfies Meta<typeof AuthLegal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
