import type { Meta, StoryObj } from "@storybook/react";
import { CareScheduleRow } from "./care-schedule-row";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { CareSchedule, CareScheduleActivityType } from "@/core/care-schedule/domain/types/care-schedule.interface";
import { CARE_SCHEDULE_ACTIVITY_TYPES } from "@/core/care-schedule/domain/types/care-schedule.interface";

const dict = getDictionary("es").careSchedule;

const mockSchedule: CareSchedule = {
  id: "cs1", plantId: "plant-1", activityType: "WATERING", intervalDays: 3, quantity: 200, unit: "ML", notes: null, nextDueAt: "2026-07-02", lastCompletedAt: null, active: true, userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "",
};

const meta = {
  title: "CareSchedule/CareScheduleRow",
  component: CareScheduleRow,
  tags: ["autodocs"],
  args: {
    careSchedule: mockSchedule,
    dict,
    plantName: "Tomate cherry",
    onComplete: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CareScheduleRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overdue: Story = {
  args: { careSchedule: { ...mockSchedule, nextDueAt: "2026-06-01" } },
};

export const Inactive: Story = {
  args: { careSchedule: { ...mockSchedule, active: false }, onEdit: undefined },
};

export const ActivityTypeGallery: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      {(CARE_SCHEDULE_ACTIVITY_TYPES as readonly CareScheduleActivityType[]).map((activityType) => (
        <CareScheduleRow key={activityType} {...args} careSchedule={{ ...mockSchedule, activityType }} />
      ))}
    </>
  ),
};
