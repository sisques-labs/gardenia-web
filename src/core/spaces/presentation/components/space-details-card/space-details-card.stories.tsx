import type { Meta, StoryObj } from "@storybook/react";
import { SpaceDetailsCard } from "./space-details-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import type { SpaceDetail } from "@/core/spaces/domain/interfaces/space-detail.interface";

const dict = getDictionary("es").spaces.settings;

const mockSpace: SpaceDetail = {
  id: "space-1",
  name: "Huerto de la abuela",
  ownerId: "u1",
  createdAt: "2026-01-01",
};

const meta = {
  title: "Spaces/SpaceDetailsCard",
  component: SpaceDetailsCard,
  tags: ["autodocs"],
  args: { space: mockSpace, isLoading: false, isError: false, dict },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpaceDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { space: undefined, isLoading: true },
};

export const Error: Story = {
  args: { space: undefined, isError: true },
};
