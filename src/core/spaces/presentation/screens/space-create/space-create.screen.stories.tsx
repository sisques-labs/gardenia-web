import type { Meta, StoryObj } from "@storybook/react";
import { SpaceCreateScreen } from "./space-create.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").spaces.create;

const meta = {
  title: "Screens/SpaceCreate",
  component: SpaceCreateScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SpaceCreateScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
