import type { Meta, StoryObj } from "@storybook/react";
import { CreatePlantModal } from "./create-plant-modal";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Plants/CreatePlantModal",
  component: CreatePlantModal,
  tags: ["autodocs"],
  args: { spaceId: "space-1", dict: getDictionary("es").plants.create, onClose: () => {} },
} satisfies Meta<typeof CreatePlantModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
