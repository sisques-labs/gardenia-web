import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceGeolocationCard } from "./space-geolocation-card";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { updateSpaceSchema, type UpdateSpaceFormValues } from "@/core/spaces/presentation/schemas/update-space.schema";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

const dict = getDictionary("es").spaces.settings;

type WrapperProps = {
  dict: AppDict["spaces"]["settings"];
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
};

function SpaceGeolocationCardStory({ dict, isPending, isError, isSuccess }: WrapperProps) {
  const updateSpaceForm = useForm<UpdateSpaceFormValues>({
    resolver: zodResolver(updateSpaceSchema),
    defaultValues: { name: "Huerto de la abuela", latitude: 40.4168, longitude: -3.7038, environment: "OUTDOOR" },
  });
  return (
    <SpaceGeolocationCard
      dict={dict}
      updateSpaceForm={updateSpaceForm}
      onSubmit={() => {}}
      isPending={isPending}
      isError={isError}
      isSuccess={isSuccess}
    />
  );
}
SpaceGeolocationCardStory.displayName = "SpaceGeolocationCardStory";

const meta = {
  title: "Spaces/SpaceGeolocationCard",
  component: SpaceGeolocationCardStory,
  tags: ["autodocs"],
  args: { dict, isPending: false, isError: false, isSuccess: false },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpaceGeolocationCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saved: Story = {
  args: { isSuccess: true },
};

export const SaveError: Story = {
  args: { isError: true },
};
