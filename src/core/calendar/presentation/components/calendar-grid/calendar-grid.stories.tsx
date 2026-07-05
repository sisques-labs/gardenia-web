import type { Meta, StoryObj } from "@storybook/react";
import { CalendarGrid } from "./calendar-grid";

const dict = {
  weekdays: { mon: "L", tue: "M", wed: "X", thu: "J", fri: "V", sat: "S", sun: "D" },
  dayAriaLabel: "Día {day}",
  todayBadge: "hoy",
};

const meta = {
  title: "Calendar/CalendarGrid",
  component: CalendarGrid,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: 520, display: "flex", flexDirection: "column" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    dict,
    selectedDate: "2026-05-10",
    onSelectDate: () => {},
  },
  argTypes: {
    year: { control: "number" },
    month: {
      control: "select",
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  },
} satisfies Meta<typeof CalendarGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const May2026: Story = {
  args: {
    year: 2026,
    month: 4,
  },
};

export const February2024Leap: Story = {
  args: {
    year: 2024,
    month: 1,
    selectedDate: "2024-02-14",
  },
};

export const December2026: Story = {
  args: {
    year: 2026,
    month: 11,
    selectedDate: "2026-12-25",
  },
};

export const WithTodayVisible: Story = {
  args: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selectedDate: new Date().toISOString().slice(0, 10),
  },
};

export const WithTaskCounts: Story = {
  args: {
    year: 2026,
    month: 4,
    taskCountByDate: { '2026-05-05': 1, '2026-05-12': 3, '2026-05-21': 2 },
  },
};
