import type { Meta, StoryObj } from "@storybook/react";
import { NumberField } from "./number-field";

const meta = {
  title: "PlantingSpots/NumberField",
  component: NumberField,
  tags: ["autodocs"],
  args: { label: "Fila", value: 2, onChange: () => {}, min: 1 },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Integer: Story = {};

export const Decimal: Story = {
  args: { label: "Ancho", value: 1.5, min: 0, integer: false, step: "any" },
};

export const WithError: Story = {
  args: { error: "Valor no válido" },
};
