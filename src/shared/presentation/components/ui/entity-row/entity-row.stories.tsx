import type { Meta, StoryObj } from "@storybook/react";
import { EntityRow, EntityRowAction } from "./entity-row";

const meta = {
  title: "Domain/EntityRow",
  component: EntityRow,
  tags: ["autodocs"],
  args: {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Tomate cherry</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>3.5 kg · 20 jun 2026</span>
      </div>
    ),
    actions: (
      <>
        <EntityRowAction label="Editar" onClick={() => {}} />
        <EntityRowAction label="Eliminar" onClick={() => {}} variant="destructive" />
      </>
    ),
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAccentAction: Story = {
  args: {
    actions: (
      <>
        <EntityRowAction label="Completar" onClick={() => {}} variant="accent" />
        <EntityRowAction label="Editar" onClick={() => {}} />
        <EntityRowAction label="Eliminar" onClick={() => {}} variant="destructive" />
      </>
    ),
  },
};
