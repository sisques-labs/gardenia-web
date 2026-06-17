import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PhotoPicker } from "./photo-picker";

const photos = [
  { src: "https://picsum.photos/seed/gardenia/400/300", alt: "Photo 1" },
  { src: "https://picsum.photos/seed/plant2/400/300", alt: "Photo 2" },
  { src: "https://picsum.photos/seed/plant3/400/300", alt: "Photo 3" },
];

const meta: Meta = {
  title: "Media/PhotoPicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledPicker() {
  const [selected, setSelected] = React.useState<number[]>([0]);
  return <PhotoPicker photos={photos} mode="multiple" selected={selected} onSelectionChange={setSelected} />;
}

export const Single: Story = { args: { photos, mode: "single", selected: [1] } };
export const Multiple: Story = { render: () => <ControlledPicker /> };
