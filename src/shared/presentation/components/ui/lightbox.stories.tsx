import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Lightbox } from "./lightbox";

const photos = [
  { src: "https://picsum.photos/seed/gardenia/400/300", alt: "Monstera leaf" },
  { src: "https://picsum.photos/seed/plant2/400/300", alt: "Pothos vine" },
];

const meta: Meta = {
  title: "Media/Lightbox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function LightboxDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open lightbox</Button>
      <Lightbox photos={photos} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export const Default: Story = { render: () => <LightboxDemo /> };
