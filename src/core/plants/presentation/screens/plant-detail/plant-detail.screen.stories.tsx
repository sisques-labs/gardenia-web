import type { Meta, StoryObj } from "@storybook/react";
import { PlantDetailScreen } from "./plant-detail.screen";
import { getDictionary } from "@/shared/presentation/i18n/get-dictionary";
import { withQueryClient } from "../../../../../../.storybook/decorators/with-query-client";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";

const dict = getDictionary("es");

const mockPlant: Plant = {
  id: "plant-1",
  name: "Tomate cherry",
  species: {
    id: "sp1",
    scientificName: "Solanum lycopersicum var. cerasiforme",
    description: null,
    imageUrl: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  userId: "u1",
  spaceId: "space-1",
  createdAt: "2026-05-01",
  updatedAt: "2026-05-01",
};

function withSpaceSeed(Story: () => React.ReactElement) {
  useSpacesStore.setState({ currentSpaceId: "space-1", isResolved: true });
  return <Story />;
}

const meta = {
  title: "Screens/PlantDetail",
  component: PlantDetailScreen,
  tags: ["autodocs"],
  args: {
    dict: dict.plants,
    careLogDict: dict.careLog,
    careScheduleDict: dict.careSchedule,
    lang: "es",
    spaceId: null,
    plantId: "plant-1",
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    withSpaceSeed,
    withQueryClient((qc) => qc.setQueryData(["plant", "space-1", "plant-1"], mockPlant)),
  ],
} satisfies Meta<typeof PlantDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Redeclares withSpaceSeed alongside the unseeded QueryClient: story-level
// decorators replace the meta's decorators array entirely, so the space seed
// must be repeated here — otherwise usePlant/usePlantCareLogs fall back to
// whatever currentSpaceId is left in localStorage from a previous story.
export const Loading: Story = {
  decorators: [withSpaceSeed, withQueryClient()],
};
