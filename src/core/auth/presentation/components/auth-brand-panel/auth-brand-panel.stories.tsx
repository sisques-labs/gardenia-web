import type { Meta, StoryObj } from "@storybook/react";
import { AuthBrandPanel } from "./auth-brand-panel";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Auth/AuthBrandPanel",
  component: AuthBrandPanel,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").auth.brandPanel },
} satisfies Meta<typeof AuthBrandPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
