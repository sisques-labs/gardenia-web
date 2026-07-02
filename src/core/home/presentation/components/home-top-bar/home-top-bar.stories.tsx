import type { Meta, StoryObj } from "@storybook/react";
import { HomeTopBar } from "./home-top-bar";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { useAuthStore } from "@/core/auth/infrastructure/store/auth.store";

const meta = {
  title: "Home/HomeTopBar",
  component: HomeTopBar,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
  decorators: [
    (Story) => {
      useAuthStore.setState({ currentUser: { id: "u1", userId: "u1", email: "elena@example.com" } });
      return <Story />;
    },
  ],
} satisfies Meta<typeof HomeTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
