import type { Meta, StoryObj } from "@storybook/react";
import { JournalSection } from "./journal-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Home/JournalSection",
  component: JournalSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
} satisfies Meta<typeof JournalSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
