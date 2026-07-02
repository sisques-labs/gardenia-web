import type { Meta, StoryObj } from "@storybook/react";
import { AuthHead } from "./auth-head";

const meta = {
  title: "Auth/AuthHead",
  component: AuthHead,
  tags: ["autodocs"],
  args: {
    eyebrow: "✦ Bienvenida de vuelta",
    title: "Iniciar sesión",
    sub: "Introduce tus datos para continuar.",
  },
} satisfies Meta<typeof AuthHead>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: { eyebrow: undefined, sub: undefined },
};
