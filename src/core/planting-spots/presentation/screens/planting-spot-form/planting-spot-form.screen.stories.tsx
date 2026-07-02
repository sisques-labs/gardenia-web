import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotFormScreen } from "./planting-spot-form.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

const dict = getDictionary("es").plantingSpots;

const mockSpot: PlantingSpot = {
  id: "ps1",
  name: "Bancal norte",
  type: "RAISED_BED",
  capacity: 6,
  row: 1,
  column: 2,
  resolvedPlants: [],
  userId: "u1",
  spaceId: "s1",
  createdAt: "2026-04-01",
  updatedAt: "2026-04-01",
};

const meta = {
  title: "Screens/PlantingSpotForm",
  component: PlantingSpotFormScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof PlantingSpotFormScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { mode: "create" },
};

export const Edit: Story = {
  args: { mode: "edit", spotId: "ps1" },
  decorators: [withQueryClient((qc) => qc.setQueryData(["planting-spot", "ps1"], mockSpot))],
};
