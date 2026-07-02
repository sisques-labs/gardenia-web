import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "./row";

const meta = {
  title: "PlantingSpots/Row",
  component: Row,
  tags: ["autodocs"],
  args: { label: "Tipo", children: "Bancal elevado" },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
