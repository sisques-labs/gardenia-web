import type { Meta, StoryObj } from "@storybook/react";
import { Droplets } from "lucide-react";
import { CareCard } from "./care-card";

const meta = {
  title: "Plants/CareCard",
  component: CareCard,
  tags: ["autodocs"],
  args: {
    icon: <Droplets className="w-4 h-4" />,
    label: "Riego",
    labelVariant: "forest",
    title: "Cada 3 días",
    description: "Mantén el sustrato húmedo pero no encharcado.",
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CareCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
