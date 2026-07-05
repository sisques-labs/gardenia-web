import type { Meta, StoryObj } from "@storybook/react";
import { CalendarCell } from "./calendar-cell";

const dict = { dayAriaLabel: "Día {day}", todayBadge: "hoy" };

const meta = {
  title: "Calendar/CalendarCell",
  component: CalendarCell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 120, height: 100, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  args: { dict },
  argTypes: {
    day: { control: "number" },
    isToday: { control: "boolean" },
    isSelected: { control: "boolean" },
  },
} satisfies Meta<typeof CalendarCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    day: 15,
    isToday: false,
    isSelected: false,
    onSelect: () => {},
  },
};

export const Today: Story = {
  args: {
    day: 18,
    isToday: true,
    isSelected: false,
    onSelect: () => {},
  },
};

export const Selected: Story = {
  args: {
    day: 10,
    isToday: false,
    isSelected: true,
    onSelect: () => {},
  },
};

export const TodayAndSelected: Story = {
  args: {
    day: 18,
    isToday: true,
    isSelected: true,
    onSelect: () => {},
  },
};

export const WithTaskCount: Story = {
  args: {
    day: 12,
    isToday: false,
    isSelected: false,
    onSelect: () => {},
    taskCount: 3,
  },
};

export const EmptySlot: Story = {
  args: {
    day: null,
    isToday: false,
    isSelected: false,
    onSelect: () => {},
  },
};
