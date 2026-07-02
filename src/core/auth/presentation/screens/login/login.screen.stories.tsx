import type { Meta, StoryObj } from "@storybook/react";
import { LoginScreen } from "./login.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").auth.login;

const meta = {
  title: "Screens/Login",
  component: LoginScreen,
  tags: ["autodocs"],
  args: { dict, locale: "es" },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
