import type { Meta, StoryObj } from "@storybook/react";
import { GrowthTimeline } from "./growth-timeline";

const stages = [
  { name: "Semilla", daysStart: 0, daysEnd: 14, color: "var(--sage)" },
  { name: "Plántula", daysStart: 14, daysEnd: 28, color: "var(--forest)" },
  { name: "Vegetativo", daysStart: 28, daysEnd: 45, color: "var(--honey)" },
  { name: "Fructificación", daysStart: 45, daysEnd: 64, color: "var(--terracotta)" },
];

const meta = {
  title: "Plants/GrowthTimeline",
  component: GrowthTimeline,
  tags: ["autodocs"],
  args: { stages, currentDay: 36, totalDays: 64 },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GrowthTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDates: Story = {
  args: { startDate: "1 mayo 2026", estimatedEndDate: "3 julio 2026" },
};
