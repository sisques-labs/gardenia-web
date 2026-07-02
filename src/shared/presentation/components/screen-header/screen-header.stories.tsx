import type { Meta, StoryObj } from "@storybook/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ScreenHeader } from "./screen-header";

const meta = {
  title: "Navigation/ScreenHeader",
  component: ScreenHeader,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    eyebrow: { control: "text" },
    subtitle: { control: "text" },
  },
} satisfies Meta<typeof ScreenHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Inventario",
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Huerto del Limonero",
    breadcrumbs: [
      { label: "Mis huertas", href: "#" },
      { label: "Huerto del Limonero" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: "Mis huertas",
    actions: (
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 999,
          background: "var(--forest)",
          color: "var(--paper)",
          fontSize: 13,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
        }}
      >
        <Plus size={14} /> Nueva huerta
      </button>
    ),
  },
};

export const WithBreadcrumbsAndActions: Story = {
  args: {
    title: "Tomate Cherry",
    breadcrumbs: [
      { label: "Inventario", href: "#" },
      { label: "Tomate Cherry" },
    ],
    actions: (
      <button
        style={{
          padding: "7px 12px",
          borderRadius: 6,
          background: "var(--paper-2)",
          border: "1px solid var(--rule)",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Editar
      </button>
    ),
  },
};

export const WithEyebrowAndSubtitle: Story = {
  args: {
    eyebrow: "CALENDARIO · VISTA MENSUAL",
    title: "Mayo 2026",
    subtitle: "· primavera",
  },
};

export const WithEyebrowSubtitleAndActions: Story = {
  args: {
    eyebrow: "CALENDARIO · VISTA MENSUAL",
    title: "Mayo 2026",
    subtitle: "· primavera",
    actions: (
      <>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            border: "1px solid var(--rule)",
            borderRadius: 6,
            background: "var(--paper-2)",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            border: "1px solid var(--rule)",
            borderRadius: 6,
            background: "var(--paper-2)",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={16} />
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--forest)",
            color: "var(--paper)",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> Nueva tarea
        </button>
      </>
    ),
  },
};
