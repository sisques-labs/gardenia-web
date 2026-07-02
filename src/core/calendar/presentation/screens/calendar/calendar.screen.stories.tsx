import type { Meta, StoryObj } from "@storybook/react";
import { CalendarScreen } from "./calendar.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";

const dict = getDictionary("es").calendar;
const careScheduleDict = getDictionary("es").careSchedule;

const meta = {
  title: "Screens/Calendar",
  component: CalendarScreen,
  tags: ["autodocs"],
  args: { dict, careScheduleDict },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => {
      useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
      return (
        <div style={{ height: 600 }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof CalendarScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
