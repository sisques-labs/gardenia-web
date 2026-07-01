import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceInvitationCard } from "./space-invitation-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { createInvitationSchema, type CreateInvitationFormValues } from "@/core/spaces/presentation/schemas/create-invitation.schema";
import type { SpaceInvitation } from "@/core/spaces/domain/types/space-invitation.type";

const dict = getDictionary("es").spaces.settings;

const mockInvitation: SpaceInvitation = {
  id: "inv1",
  displayCode: "GARD-1234",
  code: "gard-1234-secret",
  qrId: null,
  expiresAt: "2026-08-01T00:00:00Z",
  role: "MEMBER",
  spaceId: "space-1",
};

function Wrapper(args: Omit<React.ComponentProps<typeof SpaceInvitationCard>, "invForm">) {
  const invForm = useForm<CreateInvitationFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { role: "member" },
  });
  return <SpaceInvitationCard {...args} invForm={invForm} />;
}

const meta = {
  title: "Spaces/SpaceInvitationCard",
  component: Wrapper,
  tags: ["autodocs"],
  args: {
    dict,
    onSubmit: () => {},
    isPending: false,
    isError: false,
    invitation: undefined,
    copied: null,
    copy: () => {},
    inviteLink: (inv) => `https://gardenia.app/es/invite?code=${inv.code}`,
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

export const Default: Story = {};

export const WithInvitation: Story = {
  args: { invitation: mockInvitation },
};
