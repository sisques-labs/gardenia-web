import type { Meta, StoryObj } from "@storybook/react";
import { CapacityBar } from "./capacity-bar";

const meta = {
  title: "PlantingSpots/CapacityBar",
  component: CapacityBar,
  tags: ["autodocs"],
  args: { current: 3, capacity: 6 },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapacityBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = { args: { current: 6, capacity: 6 } };

export const OverCapacity: Story = { args: { current: 8, capacity: 6 } };

export const Small: Story = { args: { size: "sm" } };
