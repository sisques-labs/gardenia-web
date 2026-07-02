import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotsListScreen } from "./planting-spots-list.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

const dict = getDictionary("es").plantingSpots;

const mockSpots: PlantingSpot[] = [
  { id: "ps1", name: "Bancal norte", type: "RAISED_BED", capacity: 6, row: 1, column: 1, resolvedPlants: [], userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
  { id: "ps2", name: "Maceta balcón", type: "POT", capacity: 1, resolvedPlants: [{ id: "p1", name: "Albahaca", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" }], userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
];

const meta = {
  title: "Screens/PlantingSpotsList",
  component: PlantingSpotsListScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PlantingSpotsListScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSpots: Story = {
  decorators: [
    withQueryClient((qc) =>
      qc.setQueryData(["planting-spots", 1, 20], { items: mockSpots, total: 2, totalPages: 1, page: 1 }),
    ),
  ],
};

export const Empty: Story = {
  decorators: [
    withQueryClient((qc) =>
      qc.setQueryData(["planting-spots", 1, 20], { items: [], total: 0, totalPages: 1, page: 1 }),
    ),
  ],
};
