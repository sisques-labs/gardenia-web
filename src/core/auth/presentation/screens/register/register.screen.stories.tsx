import type { Meta, StoryObj } from "@storybook/react";
import { RegisterScreen } from "./register.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").auth.register;

const meta = {
  title: "Screens/Register",
  component: RegisterScreen,
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
} satisfies Meta<typeof RegisterScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
