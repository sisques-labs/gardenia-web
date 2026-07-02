import type { Meta, StoryObj } from "@storybook/react";
import { CareLogSummary } from "./care-log-summary";
import { CareLogActivityType } from "@/core/care-log/domain/interfaces/care-log-entry.interface";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").careLog;

const meta = {
  title: "Plants/CareLogSummary",
  component: CareLogSummary,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CareLogSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { lastCareByType: {} },
};

export const WithEntries: Story = {
  args: {
    lastCareByType: {
      [CareLogActivityType.WATERING]: { id: "c1", plantId: "p1", activityType: CareLogActivityType.WATERING, performedAt: "2026-06-28T10:00:00Z" },
      [CareLogActivityType.FERTILIZING]: { id: "c2", plantId: "p1", activityType: CareLogActivityType.FERTILIZING, performedAt: "2026-06-15T10:00:00Z" },
    },
  },
};
