import type { Meta, StoryObj } from "@storybook/react";
import { TodayTasksSection } from "./today-tasks-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { toISODate } from "@/core/care-schedule/presentation/utils/to-iso-date/to-iso-date.util";
import type { CareSchedule } from "@/core/care-schedule/domain/types/care-schedule.interface";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";

const SPACE_ID = "space-1";
const dueFilters = { active: true, dueBefore: toISODate(new Date()) };

const mockPlants: Plant[] = [
  { id: "plant-1", name: "Tomate cherry", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
];

const mockCareSchedules: CareSchedule[] = [
  {
    id: "cs-1",
    plantId: "plant-1",
    activityType: "WATERING",
    intervalDays: 3,
    quantity: null,
    unit: null,
    notes: null,
    nextDueAt: "2026-07-04",
    lastCompletedAt: null,
    active: true,
    userId: "u1",
    spaceId: SPACE_ID,
    createdAt: "2026-07-01",
    updatedAt: "2026-07-01",
  },
];

const meta = {
  title: "Home/TodayTasksSection",
  component: TodayTasksSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home, careScheduleDict: getDictionary("es").careSchedule },
  decorators: [
    (Story) => {
      useSpacesStore.setState({ currentSpaceId: SPACE_ID });
      return <Story />;
    },
  ],
} satisfies Meta<typeof TodayTasksSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTasks: Story = {
  decorators: [
    withQueryClient((qc) => {
      qc.setQueryData(["care-schedules", SPACE_ID, dueFilters], mockCareSchedules);
      qc.setQueryData(["plants", SPACE_ID], mockPlants);
    }),
  ],
};

export const Empty: Story = {
  decorators: [
    withQueryClient((qc) => {
      qc.setQueryData(["care-schedules", SPACE_ID, dueFilters], []);
      qc.setQueryData(["plants", SPACE_ID], []);
    }),
  ],
};
