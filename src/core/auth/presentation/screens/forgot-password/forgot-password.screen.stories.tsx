import type { Meta, StoryObj } from "@storybook/react";
import { ForgotPasswordScreen } from "./forgot-password.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").auth.forgotPassword;

const meta = {
  title: "Screens/ForgotPassword",
  component: ForgotPasswordScreen,
  tags: ["autodocs"],
  args: { dict },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ForgotPasswordScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
