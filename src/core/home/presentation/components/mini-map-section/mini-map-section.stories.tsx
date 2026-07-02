import type { Meta, StoryObj } from "@storybook/react";
import { MiniMapSection } from "./mini-map-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Home/MiniMapSection",
  component: MiniMapSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
} satisfies Meta<typeof MiniMapSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
