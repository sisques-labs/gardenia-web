import type { Meta, StoryObj } from "@storybook/react";
import { CalendarViewSwitcher } from "./calendar-view-switcher";

const dict = { day: "Día", week: "Semana", month: "Mes", year: "Año" };

const meta = {
  title: "Calendar/CalendarViewSwitcher",
  component: CalendarViewSwitcher,
  tags: ["autodocs"],
  args: { dict },
  argTypes: {
    activeView: {
      control: "select",
      options: ["day", "week", "month", "year"],
    },
  },
} satisfies Meta<typeof CalendarViewSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MonthActive: Story = {
  args: { activeView: "month" },
};

export const DayActive: Story = {
  args: { activeView: "day" },
};

export const WeekActive: Story = {
  args: { activeView: "week" },
};

export const YearActive: Story = {
  args: { activeView: "year" },
};
