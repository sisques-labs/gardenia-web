import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceMembersCard } from "./space-members-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { addMemberSchema, type AddMemberFormValues } from "@/core/spaces/presentation/schemas/add-member.schema";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";

const dict = getDictionary("es");

type WrapperProps = {
  dict: AppDict["spaces"]["settings"];
  memberListDict: AppDict["spaces"]["members"]["list"];
  isOwner: boolean;
};

function SpaceMembersCardStory({ dict, memberListDict, isOwner }: WrapperProps) {
  const addForm = useForm<AddMemberFormValues>({ resolver: zodResolver(addMemberSchema) });
  const removeForm = useForm<AddMemberFormValues>({ resolver: zodResolver(addMemberSchema) });
  return (
    <SpaceMembersCard
      dict={dict}
      memberListDict={memberListDict}
      isOwner={isOwner}
      addForm={addForm}
      removeForm={removeForm}
      onAddMember={() => {}}
      onRemoveMember={() => {}}
      addPending={false}
      addError={undefined}
      addSuccess={false}
      removePending={false}
      removeError={undefined}
      removeSuccess={false}
    />
  );
}
SpaceMembersCardStory.displayName = "SpaceMembersCardStory";

// SpaceMembersCard renders SpaceMembersList internally, which calls the real
// useSpaceMembers() query hook. useSpacesStore persists currentSpaceId to
// localStorage, so without an explicit seed here this story would inherit
// whatever space a previously-rendered story left behind and fire a real
// (unmocked) network request instead of resolving deterministically.
function withMembersSeed(Story: () => React.ReactElement) {
  useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
  return (
    <div style={{ maxWidth: 480 }}>
      <Story />
    </div>
  );
}

const meta = {
  title: "Spaces/SpaceMembersCard",
  component: SpaceMembersCardStory,
  tags: ["autodocs"],
  args: { dict: dict.spaces.settings, memberListDict: dict.spaces.members.list, isOwner: true },
  parameters: { layout: "padded" },
  decorators: [
    withMembersSeed,
    withQueryClient((qc) => qc.setQueryData(["space-members", "space-1"], [])),
  ],
} satisfies Meta<typeof SpaceMembersCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {};

export const NonOwner: Story = {
  args: { isOwner: false },
};
