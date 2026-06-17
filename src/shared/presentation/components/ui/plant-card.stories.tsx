import type { Meta, StoryObj } from "@storybook/react";
import { PlantCard } from "./plant-card";

const meta = {
  title: "UI/PlantCard",
  component: PlantCard,
  tags: ["autodocs"],
} satisfies Meta<typeof PlantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Monstera deliciosa",
    species: "Araceae",
    status: "Healthy",
    imageUrl: "https://picsum.photos/seed/gardenia/400/300",
    className: "w-64",
  },
};
export const WithoutImage: Story = {
  args: { name: "Snake Plant", species: "Dracaena trifasciata", status: "Needs water", className: "w-64" },
};
