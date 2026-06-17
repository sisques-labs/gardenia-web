import type { Meta, StoryObj } from "@storybook/react";
import { PhotoGrid } from "./photo-grid";

const photos = [
  { src: "https://picsum.photos/seed/gardenia/400/300", alt: "Monstera leaf" },
  { src: "https://picsum.photos/seed/plant2/400/300", alt: "Pothos vine" },
  { src: "https://picsum.photos/seed/plant3/400/300", alt: "Fern fronds" },
  { src: "https://picsum.photos/seed/plant4/400/300", alt: "Succulent" },
];

const meta = {
  title: "Media/PhotoGrid",
  component: PhotoGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof PhotoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { photos, columns: 3, className: "max-w-lg" } };
