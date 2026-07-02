import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceMembersCard } from "./space-members-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { addMemberSchema, type AddMemberFormValues } from "@/core/spaces/presentation/schemas/add-member.schema";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

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

const meta = {
  title: "Spaces/SpaceMembersCard",
  component: SpaceMembersCardStory,
  tags: ["autodocs"],
  args: { dict: dict.spaces.settings, memberListDict: dict.spaces.members.list, isOwner: true },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpaceMembersCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {};

export const NonOwner: Story = {
  args: { isOwner: false },
};
