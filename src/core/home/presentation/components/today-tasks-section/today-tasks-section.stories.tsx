import type { Meta, StoryObj } from "@storybook/react";
import { TodayTasksSection } from "./today-tasks-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Home/TodayTasksSection",
  component: TodayTasksSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
} satisfies Meta<typeof TodayTasksSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
