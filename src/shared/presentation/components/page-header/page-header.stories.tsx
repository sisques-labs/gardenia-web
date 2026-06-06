import type { Meta, StoryObj } from "@storybook/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "./page-header";

const meta = {
  title: "Navigation/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Mayo 2026",
  },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "CALENDARIO · VISTA MENSUAL",
    title: "Mayo 2026",
  },
};

export const WithSubtitle: Story = {
  args: {
    eyebrow: "CALENDARIO · VISTA MENSUAL",
    title: "Mayo 2026",
    subtitle: "· primavera",
  },
};

export const WithActions: Story = {
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

export const HomeStyle: Story = {
  args: {
    eyebrow: "Huerto del Limonero · Valencia · primavera",
    title: "Buenos días, Marina.",
    subtitle: "la huerta te espera",
  },
};
