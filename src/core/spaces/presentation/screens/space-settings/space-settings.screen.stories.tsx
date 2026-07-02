import type { Meta, StoryObj } from "@storybook/react";
import { SpaceSettingsScreen } from "./space-settings.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import type { Space } from "@/core/spaces/domain/interfaces/space.interface";

const dict = getDictionary("es");

const mockSpace: Space = {
  id: "space-1",
  name: "Huerto de la abuela",
  ownerId: "u1",
  createdAt: "2026-01-01",
  latitude: 40.4168,
  longitude: -3.7038,
  environment: "OUTDOOR",
};

const meta = {
  title: "Screens/SpaceSettings",
  component: SpaceSettingsScreen,
  tags: ["autodocs"],
  args: {
    dict: dict.spaces.settings,
    weatherDict: dict.spaces.weather,
    memberListDict: dict.spaces.members.list,
    lang: "es",
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => {
      useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
      return (
        <div style={{ maxWidth: 640 }}>
          <Story />
        </div>
      );
    },
    withQueryClient((qc) => qc.setQueryData(["space-detail", "space-1"], mockSpace)),
  ],
} satisfies Meta<typeof SpaceSettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
