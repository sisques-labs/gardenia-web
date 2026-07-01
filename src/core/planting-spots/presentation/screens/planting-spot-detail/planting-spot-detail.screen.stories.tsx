import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotDetailScreen } from "./planting-spot-detail.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

const dict = getDictionary("es").plantingSpots;

const mockSpot: PlantingSpot = {
  id: "ps1",
  name: "Bancal norte",
  type: "RAISED_BED",
  description: "Bancal elevado junto al muro sur.",
  capacity: 6,
  row: 1,
  column: 2,
  soilType: "Franco arcilloso",
  resolvedPlants: [
    { id: "p1", name: "Tomate cherry", userId: "u1", spaceId: "s1", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
    { id: "p2", name: "Albahaca", userId: "u1", spaceId: "s1", createdAt: "2026-05-10", updatedAt: "2026-05-10" },
  ],
  userId: "u1",
  spaceId: "s1",
  createdAt: "2026-04-01",
  updatedAt: "2026-04-01",
};

const meta = {
  title: "Screens/PlantingSpotDetail",
  component: PlantingSpotDetailScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es", spotId: "ps1" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PlantingSpotDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["planting-spot", "ps1"], mockSpot))],
};

export const Loading: Story = {
  decorators: [withQueryClient()],
};
