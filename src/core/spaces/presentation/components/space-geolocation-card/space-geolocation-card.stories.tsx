import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceGeolocationCard } from "./space-geolocation-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { updateSpaceSchema, type UpdateSpaceFormValues } from "@/core/spaces/presentation/schemas/update-space.schema";

const dict = getDictionary("es").spaces.settings;

function Wrapper(args: Omit<React.ComponentProps<typeof SpaceGeolocationCard>, "updateSpaceForm">) {
  const updateSpaceForm = useForm<UpdateSpaceFormValues>({
    resolver: zodResolver(updateSpaceSchema),
    defaultValues: { name: "Huerto de la abuela", latitude: 40.4168, longitude: -3.7038, environment: "OUTDOOR" },
  });
  return <SpaceGeolocationCard {...args} updateSpaceForm={updateSpaceForm} />;
}

const meta = {
  title: "Spaces/SpaceGeolocationCard",
  component: Wrapper,
  tags: ["autodocs"],
  args: { dict, onSubmit: () => {}, isPending: false, isError: false, isSuccess: false },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <Wrapper {...args} />,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saved: Story = {
  args: { isSuccess: true },
};

export const SaveError: Story = {
  args: { isError: true },
};
