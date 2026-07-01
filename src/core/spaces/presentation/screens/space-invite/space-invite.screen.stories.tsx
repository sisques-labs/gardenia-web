import type { Meta, StoryObj } from "@storybook/react";
import { SpaceInviteScreen } from "./space-invite.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").spaces.invite;

const meta = {
  title: "Screens/SpaceInvite",
  component: SpaceInviteScreen,
  tags: ["autodocs"],
  args: { dict, lang: "es" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SpaceInviteScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// No ?code= search param — the flow stops before touching auth/network and
// renders the "missing code" message deterministically.
export const MissingCode: Story = {};
