import type { Meta, StoryObj } from "@storybook/react";
import { CareScheduleList } from "./care-schedule-list";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import type { CareSchedule } from "@/core/care-schedule/domain/types/care-schedule.interface";

const dict = getDictionary("es").careSchedule;

const mockSchedules: CareSchedule[] = [
  { id: "cs1", plantId: "plant-1", activityType: "WATERING", intervalDays: 3, quantity: 200, unit: "ML", notes: null, nextDueAt: "2026-07-02", lastCompletedAt: "2026-06-29", active: true, userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" },
];

function withSpaceSeed(Story: () => React.ReactElement) {
  useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
  return (
    <div style={{ maxWidth: 480 }}>
      <Story />
    </div>
  );
}

const meta = {
  title: "CareSchedule/CareScheduleList",
  component: CareScheduleList,
  tags: ["autodocs"],
  args: { dict, plantId: "plant-1" },
  parameters: { layout: "padded" },
  decorators: [withSpaceSeed],
} satisfies Meta<typeof CareScheduleList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story-level decorators replace the meta's array entirely, so withSpaceSeed
// is repeated alongside each query seed here.
export const WithSchedules: Story = {
  decorators: [
    withSpaceSeed,
    withQueryClient((qc) => qc.setQueryData(["care-schedules", "space-1", { plantId: "plant-1" }], mockSchedules)),
  ],
};

export const Empty: Story = {
  decorators: [
    withSpaceSeed,
    withQueryClient((qc) => qc.setQueryData(["care-schedules", "space-1", { plantId: "plant-1" }], [])),
  ],
};
