import type { Meta, StoryObj } from "@storybook/react";
import { InDevelopment } from "./in-development";

const meta = {
  title: "UI/InDevelopment",
  component: InDevelopment,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
} satisfies Meta<typeof InDevelopment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: "Tareas del día",
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Esta sección está en construcción. Vuelve pronto.",
  },
};
