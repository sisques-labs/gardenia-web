import type { Meta, StoryObj } from "@storybook/react";
import { HomeScreen } from "./home.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").home;

const meta = {
  title: "Screens/Home",
  component: HomeScreen,
  tags: ["autodocs"],
  args: { dict },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 700 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
