import type { Meta, StoryObj } from "@storybook/react";
import { PlantsListScreen } from "./plants-list.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";
import type { PaginatedResult } from "@/shared/domain/interfaces/paginated-result.interface";

const dict = getDictionary("es").plants;

const mockPlants: Plant[] = [
  { id: "p1", name: "Tomate cherry", plantSpeciesId: "sp1", userId: "u1", spaceId: "space-1", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "p2", name: "Albahaca", plantSpeciesId: "sp2", userId: "u1", spaceId: "space-1", createdAt: "2026-05-10", updatedAt: "2026-05-10" },
];

function paginated(items: Plant[]): PaginatedResult<Plant> {
  return { items, total: items.length, page: 1, perPage: 20, totalPages: 1 };
}

const meta = {
  title: "Screens/PlantsList",
  component: PlantsListScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es", spaceId: "space-1" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PlantsListScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPlants: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["plants", "paginated", "space-1", 1, 20, []], paginated(mockPlants)))],
};

export const Empty: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["plants", "paginated", "space-1", 1, 20, []], paginated([])))],
};
