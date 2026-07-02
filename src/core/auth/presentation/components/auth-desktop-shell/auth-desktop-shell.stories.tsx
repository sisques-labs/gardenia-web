import type { Meta, StoryObj } from "@storybook/react";
import { AuthDesktopShell } from "./auth-desktop-shell";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Auth/AuthDesktopShell",
  component: AuthDesktopShell,
  tags: ["autodocs"],
  args: {
    brandDict: getDictionary("es").auth.brandPanel,
    children: <p>Formulario de ejemplo</p>,
  },
} satisfies Meta<typeof AuthDesktopShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
