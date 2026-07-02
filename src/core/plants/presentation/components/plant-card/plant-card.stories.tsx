import type { Meta, StoryObj } from "@storybook/react"
import { PlantCard } from "./plant-card"

const cardDict = {
  delete: "Eliminar planta",
  health: {
    good: "Saludable",
    warn: "Requiere atención",
    bad: "En riesgo",
    inactive: "Inactiva",
  },
}

const mockPlant = {
  id: "1",
  name: "Tomate Cherry",
  species: {
    id: "1",
    scientificName: "Solanum lycopersicum",
    description: null,
    imageUrl: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
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
    cardDict,
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 224 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlantCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCareInfo: Story = {
  args: {
    careLabel: "Riego",
    careDate: "2026-04-12T10:00:00.000Z",
    status: "good",
  },
}

export const WithWarning: Story = {
  args: {
    careLabel: "Riego",
    careDate: "2026-04-12T10:00:00.000Z",
    status: "warn",
  },
}

export const WithAlert: Story = {
  args: {
    careLabel: "Riego",
    careDate: "2026-04-12T10:00:00.000Z",
    status: "bad",
  },
}

export const NoSpecies: Story = {
  args: {
    plant: { ...mockPlant, species: undefined },
    careLabel: "Riego",
    status: "good",
    careDate: "2026-04-12T10:00:00.000Z",
  },
}
