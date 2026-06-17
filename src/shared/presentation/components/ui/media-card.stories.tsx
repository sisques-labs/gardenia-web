import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { MediaCard } from "./media-card";

const meta = {
  title: "Media/MediaCard",
  component: MediaCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<typeof MediaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    variant: "vertical",
    src: "https://picsum.photos/seed/gardenia/400/300",
    alt: "Monstera",
    title: "Monstera deliciosa",
    description: "Swiss cheese plant in the living room.",
    className: "w-64",
  },
};
export const Horizontal: Story = {
  args: {
    variant: "horizontal",
    src: "https://picsum.photos/seed/plant2/400/300",
    alt: "Pothos",
    title: "Golden Pothos",
    description: "Trailing vine on the bookshelf.",
    actions: <Button size="sm" variant="outline">View</Button>,
    className: "w-96",
  },
};
