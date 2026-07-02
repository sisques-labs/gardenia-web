import type { Meta, StoryObj } from "@storybook/react";
import { SpaceMembersList } from "./space-members-list";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";

const dict = getDictionary("es").spaces.members.list;

const mockMembers = [
  { id: "u1", status: "ACTIVE", username: "elena", firstName: "Elena", lastName: "Ruiz", avatarUrl: null, createdAt: "" },
  { id: "u2", status: "ACTIVE", username: "javi", firstName: null, lastName: null, avatarUrl: null, createdAt: "" },
];

function withSpaceSeed(Story: () => React.ReactElement) {
  useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
  return (
    <div style={{ maxWidth: 320 }}>
      <Story />
    </div>
  );
}

const meta = {
  title: "Spaces/SpaceMembersList",
  component: SpaceMembersList,
  tags: ["autodocs"],
  args: { dict },
  parameters: { layout: "padded" },
  decorators: [withSpaceSeed],
} satisfies Meta<typeof SpaceMembersList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story-level decorators replace the meta's array entirely, so withSpaceSeed
// is repeated alongside each query seed here.
export const WithMembers: Story = {
  decorators: [withSpaceSeed, withQueryClient((qc) => qc.setQueryData(["space-members", "space-1"], mockMembers))],
};

export const Empty: Story = {
  decorators: [withSpaceSeed, withQueryClient((qc) => qc.setQueryData(["space-members", "space-1"], []))],
};

export const Loading: Story = {
  decorators: [withSpaceSeed, withQueryClient()],
};
