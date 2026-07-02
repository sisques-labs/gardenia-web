import type { Meta, StoryObj } from "@storybook/react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AuthField } from "./auth-field";

const registration = {
  name: "email",
  onChange: async () => {},
  onBlur: async () => {},
  ref: () => {},
} as unknown as UseFormRegisterReturn;

const meta = {
  title: "Auth/AuthField",
  component: AuthField,
  tags: ["autodocs"],
  args: {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "tu@ejemplo.com",
    registration,
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "El correo no es válido" },
};

export const Password: Story = {
  args: {
    id: "password",
    label: "Contraseña",
    type: "password",
    showLabel: "Mostrar",
    hideLabel: "Ocultar",
  },
};
