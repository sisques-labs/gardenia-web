import type { Meta, StoryObj } from "@storybook/react";
import { HarvestPaceSection } from "./harvest-pace-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Home/HarvestPaceSection",
  component: HarvestPaceSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
} satisfies Meta<typeof HarvestPaceSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
