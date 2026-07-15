import type { Meta, StoryObj } from "@storybook/react";
import { PlantingSpotCard } from "./planting-spot-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";

const dict = getDictionary("es").plantingSpots;

const mockSpot: PlantingSpot = {
  id: "ps1",
  name: "Bancal norte",
  type: "RAISED_BED",
  capacity: 6,
  row: 1,
  column: 1,
  status: "ACTIVE",
  fallowSince: null,
  resolvedPlants: [
    { id: "p1", name: "Tomate", userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" },
  ],
  userId: "u1",
  spaceId: "s1",
  createdAt: "",
  updatedAt: "",
};

const meta = {
  title: "PlantingSpots/PlantingSpotCard",
  component: PlantingSpotCard,
  tags: ["autodocs"],
  args: { spot: mockSpot, dict, lang: "es" },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlantingSpotCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = {
  args: { spot: { ...mockSpot, resolvedPlants: Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, name: `Planta ${i}`, userId: "u1", spaceId: "s1", createdAt: "", updatedAt: "" })) } },
};

export const NoCapacity: Story = {
  args: { spot: { ...mockSpot, capacity: null, row: null, column: null } },
};
