import type { Meta, StoryObj } from "@storybook/react";
import { DayTasksPanel } from "./day-tasks-panel";

const dict = {
  todayPrefix: "Hoy",
  inDevLabel: "Tareas del día",
  monthAbbreviations: {
    january: "ene", february: "feb", march: "mar", april: "abr", may: "may", june: "jun",
    july: "jul", august: "ago", september: "sep", october: "oct", november: "nov", december: "dic",
  },
};

const meta = {
  title: "Calendar/DayTasksPanel",
  component: DayTasksPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 288, height: 500, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
  args: { dict },
  argTypes: {
    selectedDate: { control: "text" },
  },
} satisfies Meta<typeof DayTasksPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const todayISO = new Date().toISOString().slice(0, 10);

export const Today: Story = {
  args: {
    selectedDate: todayISO,
  },
};

export const PastDate: Story = {
  args: {
    selectedDate: "2026-05-10",
  },
};

export const FutureDate: Story = {
  args: {
    selectedDate: "2026-12-25",
  },
};
