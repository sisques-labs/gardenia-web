import type { Meta, StoryObj } from "@storybook/react";
import { GrowingNowSection } from "./growing-now-section";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";

const SPACE_ID = "space-1";

const mockPlants: Plant[] = [
  { id: "p1", name: "Tomate cherry", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "p2", name: "Albahaca", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-10", updatedAt: "2026-05-10" },
  { id: "p3", name: "Lechuga", userId: "u1", spaceId: SPACE_ID, createdAt: "2026-05-12", updatedAt: "2026-05-12" },
];

const meta = {
  title: "Home/GrowingNowSection",
  component: GrowingNowSection,
  tags: ["autodocs"],
  args: { dict: getDictionary("es").home },
  decorators: [
    (Story) => {
      useSpacesStore.setState({ currentSpaceId: SPACE_ID });
      return <Story />;
    },
  ],
} satisfies Meta<typeof GrowingNowSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPlants: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["plants", SPACE_ID], mockPlants))],
};

export const Empty: Story = {
  decorators: [withQueryClient((qc) => qc.setQueryData(["plants", SPACE_ID], []))],
};
