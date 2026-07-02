import type { Meta, StoryObj } from "@storybook/react";
import { DayTasksPanel } from "./day-tasks-panel";
import careScheduleDict from "@/core/care-schedule/presentation/i18n/es";

const dict = {
  todayPrefix: "Hoy",
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
  args: { dict, careScheduleDict, careSchedules: [], isLoading: false, plants: [], onComplete: () => {}, onDelete: () => {} },
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

export const WithTasks: Story = {
  args: {
    selectedDate: todayISO,
    plants: [{ id: "plant-1", name: "Monstera" }],
    careSchedules: [
      {
        id: "cs-1",
        plantId: "plant-1",
        activityType: "WATERING",
        intervalDays: 3,
        quantity: null,
        unit: null,
        notes: null,
        nextDueAt: todayISO,
        lastCompletedAt: null,
        active: true,
        userId: "user-1",
        spaceId: "space-1",
        createdAt: "2026-05-01",
        updatedAt: "2026-05-01",
      },
    ],
  },
};
