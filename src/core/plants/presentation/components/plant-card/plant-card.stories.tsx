import type { Meta, StoryObj } from "@storybook/react"
import { PlantCard } from "./plant-card"

const mockPlant = {
  id: "1",
  name: "Tomate Cherry",
  species: { id: "1", name: "Solanum lycopersicum", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  imageUrl: undefined,
  userId: "user-1",
  spaceId: "space-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const meta = {
  title: "Domain/PlantCard",
  component: PlantCard,
  tags: ["autodocs"],
  args: {
    plant: mockPlant,
    lang: "es",
    noSpecies: "Sin especie",
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlantCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTag: Story = {
  args: { tag: "Hortaliza" },
}

export const WithStatus: Story = {
  args: { status: "good", tag: "Aromática" },
}

export const WithWarning: Story = {
  args: { status: "warn", tag: "Árbol" },
}

export const WithAlert: Story = {
  args: { status: "bad", tag: "Hortaliza" },
}

export const NoSpecies: Story = {
  args: {
    plant: { ...mockPlant, species: undefined },
    tag: "Flor",
    status: "good",
  },
}
