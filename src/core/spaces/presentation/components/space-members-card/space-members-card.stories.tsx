import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceMembersCard } from "./space-members-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { addMemberSchema, type AddMemberFormValues } from "@/core/spaces/presentation/schemas/add-member.schema";

const dict = getDictionary("es");

function Wrapper(args: Omit<React.ComponentProps<typeof SpaceMembersCard>, "addForm" | "removeForm">) {
  const addForm = useForm<AddMemberFormValues>({ resolver: zodResolver(addMemberSchema) });
  const removeForm = useForm<AddMemberFormValues>({ resolver: zodResolver(addMemberSchema) });
  return <SpaceMembersCard {...args} addForm={addForm} removeForm={removeForm} />;
}

const meta = {
  title: "Spaces/SpaceMembersCard",
  component: Wrapper,
  tags: ["autodocs"],
  args: {
    dict: dict.spaces.settings,
    memberListDict: dict.spaces.members.list,
    isOwner: true,
    onAddMember: () => {},
    onRemoveMember: () => {},
    addPending: false,
    addError: undefined,
    addSuccess: false,
    removePending: false,
    removeError: undefined,
    removeSuccess: false,
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Wrapper {...args} />,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Owner: Story = {};

export const NonOwner: Story = {
  args: { isOwner: false },
};
