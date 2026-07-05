import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotsSummarySection } from "./planting-spots-summary-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

function spot(id: string, type: PlantingSpot["type"], status: PlantingSpot["status"]): PlantingSpot {
  return {
    id,
    name: id,
    type,
    status,
    userId: "u1",
    spaceId: "space-1",
    resolvedPlants: [],
    createdAt: "2026-05-01",
    updatedAt: "2026-05-01",
  };
}

const mockSpots: PlantingSpot[] = [
  spot("s1", "RAISED_BED", "ACTIVE"),
  spot("s2", "RAISED_BED", "ACTIVE"),
  spot("s3", "POT", "ACTIVE"),
  spot("s4", "CONTAINER", "FALLOW"),
];

const meta = {
  title: "Home/PlantingSpotsSummarySection",
  component: PlantingSpotsSummarySection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home, plantingSpotsDict: getDictionary("es").plantingSpots },
} satisfies Meta<typeof PlantingSpotsSummarySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSpots: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["planting-spots", 1, 100], { items: mockSpots, total: mockSpots.length, page: 1, totalPages: 1 }))],
};

export const Empty: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["planting-spots", 1, 100], { items: [], total: 0, page: 1, totalPages: 1 }))],
};
