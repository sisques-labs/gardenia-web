import type { Meta, StoryObj } from "@storybook/react";
import { HomeScreen } from "./home.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useAuthStore } from "@/core/auth/infrastructure/store/auth.store";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { toISODate } from "@/core/care-schedule/presentation/utils/to-iso-date/to-iso-date.util";
import type { CareSchedule } from "@/core/care-schedule/domain/types/care-schedule.interface";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

const dict = getDictionary("es").home;
const SPACE_ID = "space-1";
const dueFilters = { active: true, dueBefore: toISODate(new Date()) };

const mockPlants: Plant[] = [
  { id: "p1", name: "Tomate cherry", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "p2", name: "Albahaca", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-10", updatedAt: "2026-05-10" },
];

const mockCareSchedules: CareSchedule[] = [
  {
    id: "cs-1",
    plantId: "p1",
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

const mockSpots: PlantingSpot[] = [
  { id: "s1", name: "s1", type: "RAISED_BED", status: "ACTIVE", userId: "u1", spaceId: SPACE_ID, resolvedPlants: [], createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "s2", name: "s2", type: "POT", status: "FALLOW", userId: "u1", spaceId: SPACE_ID, resolvedPlants: [], createdAt: "2026-05-01", updatedAt: "2026-05-01" },
];

const meta = {
  title: "Screens/Home",
  component: HomeScreen,
  tags: ["autodocs"],
  args: {
    dict,
    careScheduleDict: getDictionary("es").careSchedule,
    plantingSpotsDict: getDictionary("es").plantingSpots,
    plantsDict: getDictionary("es").plants.create,
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => {
      useAuthStore.setState({ currentUser: { id: "u1", userId: "u1", email: "elena@example.com" } });
      useSpacesStore.setState({ currentSpaceId: SPACE_ID });
      return (
        <div style={{ height: 700 }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    withQueryClient((qc) => {
      qc.setQueryData(["care-schedules", SPACE_ID, dueFilters], mockCareSchedules);
      qc.setQueryData(["plants", SPACE_ID], mockPlants);
      qc.setQueryData(["planting-spots", 1, 100], { items: mockSpots, total: mockSpots.length, page: 1, totalPages: 1 });
    }),
  ],
};

export const Empty: Story = {
  decorators: [
    withQueryClient((qc) => {
      qc.setQueryData(["care-schedules", SPACE_ID, dueFilters], []);
      qc.setQueryData(["plants", SPACE_ID], []);
      qc.setQueryData(["planting-spots", 1, 100], { items: [], total: 0, page: 1, totalPages: 1 });
    }),
  ],
};
