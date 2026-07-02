import type { Meta, StoryObj } from "@storybook/react";
import { CareScheduleModal } from "./care-schedule-modal";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";
import type { CareSchedule } from "@/core/care-schedule/domain/types/care-schedule.interface";

const dict = getDictionary("es").careSchedule;

const mockPlants: Plant[] = [
  { id: "plant-1", name: "Tomate cherry", userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" },
];

const mockCareSchedule: CareSchedule = {
  id: "cs1", plantId: "plant-1", activityType: "WATERING", intervalDays: 3, quantity: 200, unit: "ML", notes: null, nextDueAt: "2026-07-02", lastCompletedAt: null, active: true, userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "",
};

const meta = {
  title: "CareSchedule/CareScheduleModal",
  component: CareScheduleModal,
  tags: ["autodocs"],
  args: { dict, onClose: () => {} },
  decorators: [
    (Story) => {
      useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
      return <Story />;
    },
    withQueryClient((qc) => qc.setQueryData(["plants", "space-1"], mockPlants)),
  ],
} satisfies Meta<typeof CareScheduleModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: { careSchedule: mockCareSchedule },
};
