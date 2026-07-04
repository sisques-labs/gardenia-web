import type { Meta, StoryObj } from "@storybook/react";
import { EditPlantModal } from "./edit-plant-modal";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";

const meta = {
  title: "Plants/EditPlantModal",
  component: EditPlantModal,
  tags: ["autodocs"],
  args: {
    plant: { id: "plant-1", name: "Monstera", imageUrl: "https://example.com/monstera.jpg" },
    dict: getDictionary("es").plants.edit,
    onClose: () => {},
  },
} satisfies Meta<typeof EditPlantModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
