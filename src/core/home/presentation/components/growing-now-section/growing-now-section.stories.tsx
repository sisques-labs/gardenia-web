import type { Meta, StoryObj } from "@storybook/react";
import { GrowingNowSection } from "./growing-now-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Home/GrowingNowSection",
  component: GrowingNowSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
} satisfies Meta<typeof GrowingNowSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
