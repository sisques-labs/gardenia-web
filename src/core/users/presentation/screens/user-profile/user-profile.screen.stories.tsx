import type { Meta, StoryObj } from "@storybook/react";
import { UserProfileScreen } from "./user-profile.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useAuthStore } from "@/core/auth/infrastructure/store/auth.store";
import type { User } from "@/core/users/domain/interfaces/user.interface";

const dict = getDictionary("es").users;

const mockUser: User = {
  id: "user-1",
  status: "ACTIVE",
  username: "gardener_es",
  firstName: "Elena",
  lastName: "Ruiz",
  bio: "Cultivando tomates desde 2019.",
  createdAt: "2025-01-01",
};

const meta = {
  title: "Screens/UserProfile",
  component: UserProfileScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        isBootComplete: true,
        currentUser: { id: "user-1", userId: "user-1", email: "elena@example.com" },
      });
      return <Story />;
    },
    withQueryClient((qc) => qc.setQueryData(["user", "user-1"], mockUser)),
  ],
} satisfies Meta<typeof UserProfileScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
