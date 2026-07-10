import careScheduleDict from "@/core/care-schedule/presentation/i18n/en";
import type { Plant } from "@/core/plants/domain/interfaces/plant.interface";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn();
const mockPush = vi.fn();
const mockMutate = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock("@/core/plants/presentation/hooks/use-plant/use-plant.hook", () => ({
  usePlant: vi.fn(),
}));

vi.mock("@/core/spaces/infrastructure/store/spaces.store", () => ({
  useSpacesStore: vi.fn(
    (selector: (s: { currentSpaceId: string | null }) => unknown) =>
      selector({ currentSpaceId: "s1" }),
  ),
}));

vi.mock(
  "@/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook",
  () => ({
    usePlantCareLogs: vi.fn(() => ({ data: {}, isLoading: false })),
  }),
);

vi.mock(
  "@/core/care-schedule/presentation/hooks/use-water-plant/use-water-plant.hook",
  () => ({
    useWaterPlant: vi.fn(() => ({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    })),
  }),
);

vi.mock(
  "@/core/care-log/presentation/components/care-log-summary/care-log-summary",
  () => ({
    CareLogSummary: () => null,
  }),
);

vi.mock(
  "@/core/care-schedule/presentation/components/care-schedule-list/care-schedule-list",
  () => ({
    CareScheduleList: vi.fn(() => null),
  }),
);

vi.mock(
  "@/core/plant-photos/presentation/components/plant-photo-gallery/plant-photo-gallery",
  () => ({
    PlantPhotoGallery: () => (
      <button data-testid="btn-add-photo">Add photo</button>
    ),
  }),
);

const mockQrDownload = vi.fn();
vi.mock(
  "@/shared/presentation/hooks/use-qr-download/use-qr-download.hook",
  () => ({
    useQrDownload: () => ({ download: mockQrDownload }),
  }),
);

vi.mock(
  "@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook",
  () => ({
    useDeletePlant: vi.fn(() => ({ mutate: vi.fn(), isError: false })),
  }),
);

vi.mock(
  "@/core/plants/presentation/components/plant-planting-spot-field/plant-planting-spot-field",
  () => ({
    PlantPlantingSpotField: () => null,
  }),
);

vi.mock(
  "@/core/plants/presentation/components/edit-plant-modal/edit-plant-modal",
  () => ({
    EditPlantModal: ({ plant }: { plant: { id: string } }) => (
      <div data-testid="edit-plant-modal" data-plant-id={plant.id} />
    ),
  }),
);

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import { CareScheduleList } from "@/core/care-schedule/presentation/components/care-schedule-list/care-schedule-list";
import { useWaterPlant } from "@/core/care-schedule/presentation/hooks/use-water-plant/use-water-plant.hook";
import { usePlant } from "@/core/plants/presentation/hooks/use-plant/use-plant.hook";
import { PlantDetailScreen } from "./plant-detail.screen";

const mockPlant: Plant = {
  id: "p1",
  name: "Monstera",
  userId: "u1",
  spaceId: "s1",
  species: {
    id: "sp1",
    scientificName: "Monstera deliciosa",
    description: null,
    imageUrl: null,
    createdAt: "",
    updatedAt: "",
  },
  imageUrl: "https://example.com/plant.jpg",
  plantingSpot: { id: "ps1", name: "Bancal norte", type: "RAISED_BED" },
  qr: {
    id: "qr1",
    spaceId: "s1",
    targetUrl: "https://example.com",
    generation: 1,
    image: "base64data",
    createdAt: "",
    updatedAt: "",
  },
  createdAt: "",
  updatedAt: "",
};

const dict = {
  nav: "Inventory",
  list: {
    title: "Garden Catalog",
    newPlant: "New plant",
    empty: "No plants yet",
    filterAll: "All",
    filters: "Filters",
    searchPlaceholder: "Search plants...",
    searchChipLabel: "Search",
    statsPlants: "plants",
    statsSpecies: "species",
    inProgress: "Coming soon",
    categories: {
      vegetable: "Vegetable",
      herb: "Herb",
      leafy: "Leafy",
      root: "Root",
      flower: "Flower",
      tree: "Tree",
    },
    card: {
      delete: "Delete plant",
      health: {
        good: "Healthy",
        warn: "Needs attention",
        bad: "At risk",
        inactive: "Inactive",
      },
    },
  },
  create: {
    title: "New plant",
    name: "Name",
    namePlaceholder: "e.g. Monstera",
    nameRequired: "Name is required",
    nameMax: "At most 100 characters",
    imageUrl: "Image URL",
    imageUrlPlaceholder: "https://...",
    submit: "Create",
    submitting: "Creating...",
    cancel: "Cancel",
    error: "Could not create the plant. Try again.",
  },
  edit: {
    title: "Edit plant",
    name: "Name",
    namePlaceholder: "e.g. Monstera",
    nameRequired: "Name is required",
    nameMax: "At most 100 characters",
    imageUrl: "Image URL",
    imageUrlPlaceholder: "https://...",
    submit: "Save",
    submitting: "Saving...",
    cancel: "Cancel",
    error: "Could not update the plant. Try again.",
  },
  detail: {
    breadcrumbList: "Inventory",
    noSpecies: "Unknown species",
    actions: {
      markWatered: "Mark watered",
      markWateredError: "Could not log the watering. Try again.",
      edit: "Edit",
    },
    care: {
      lastWatered: "Last watered",
      neverWatered: "Not watered yet",
    },
    addedOn: "In your garden since",
    plantingSpot: {
      label: "Planting spot",
      unassigned: "Unassigned",
      placeholder: "Select a planting spot",
      updateError: "Could not update the planting spot. Try again.",
    },
    qr: {
      label: "Label · QR",
      hint: "Print and stick on the pot",
      download: "Download PDF",
    },
    calendarTitle: "Upcoming tasks",
  },
  delete: {
    button: "Delete plant",
    confirmTitle: "Delete plant",
    confirmDescription: "This action cannot be undone.",
    confirm: "Delete",
    cancel: "Cancel",
    error: "Could not delete the plant. Try again.",
  },
};

const careLogDict = {
  sectionTitle: "Last care",
  empty: "No care activities logged yet.",
  activityTypes: {
    WATERING: "Watering",
    FERTILIZING: "Fertilizing",
    PRUNING: "Pruning",
    REPOTTING: "Repotting",
    TRANSPLANTING: "Transplanting",
    PEST_TREATMENT: "Pest treatment",
    MISTING: "Misting",
    ROTATION: "Rotation",
    OTHER: "Other",
  },
};

const photosDict = {
  addPhoto: "Add photo",
  uploading: "Uploading...",
  uploadError: "Could not upload the photo. Try again.",
  deletePhoto: "Delete photo",
  deleteError: "Could not delete the photo. Try again.",
  uploadedOn: "Uploaded on",
};

describe("PlantDetailScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWaterPlant).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useWaterPlant>);
  });

  it('renders plant name via data-testid="plant-name"', () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("plant-name")).toHaveTextContent("Monstera");
  });

  it('renders species name via data-testid="plant-species"', () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("plant-species")).toHaveTextContent(
      "Monstera deliciosa",
    );
  });

  it("renders a planting spot chip when plant.plantingSpot exists", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("chip-planting-spot")).toHaveTextContent(
      "Bancal norte",
    );
  });

  it("does NOT render a planting spot chip when plant.plantingSpot is absent", () => {
    const plantWithoutSpot: Plant = { ...mockPlant, plantingSpot: undefined };
    vi.mocked(usePlant).mockReturnValue({
      data: plantWithoutSpot,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.queryByTestId("chip-planting-spot")).not.toBeInTheDocument();
  });

  it('shows the "never watered" copy when there is no watering care log', () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("plant-last-watered")).toHaveTextContent(
      "Not watered yet",
    );
  });

  it("renders the mark-watered, edit, delete and add-photo actions (no new-note)", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("btn-mark-watered")).not.toBeDisabled();
    expect(screen.getByTestId("btn-edit-plant")).not.toBeDisabled();
    expect(screen.getByTestId("btn-delete-plant")).not.toBeDisabled();
    expect(screen.getByTestId("btn-add-photo")).toBeInTheDocument();
    expect(screen.queryByTestId("btn-new-note")).not.toBeInTheDocument();
  });

  it('opens the edit modal for the current plant when "edit" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );
    expect(screen.queryByTestId("edit-plant-modal")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("btn-edit-plant"));

    expect(screen.getByTestId("edit-plant-modal")).toHaveAttribute(
      "data-plant-id",
      "p1",
    );
  });

  it('calls useWaterPlant().mutate with plantId when "mark watered" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );
    await user.click(screen.getByTestId("btn-mark-watered"));

    expect(mockMutate).toHaveBeenCalledWith({ plantId: "p1" });
  });

  it("renders an error alert when marking watered fails", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);
    vi.mocked(useWaterPlant).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useWaterPlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(
      screen.getByText("Could not log the watering. Try again."),
    ).toBeInTheDocument();
  });

  it("renders QR card when plant.qr exists", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("qr-card")).toBeInTheDocument();
    expect(screen.getByTestId("qr-image")).toHaveAttribute(
      "src",
      "data:image/png;base64,base64data",
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("downloads the QR code image when the download button is clicked", async () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    const downloadBtn = screen.getByTestId("qr-download-btn");
    expect(downloadBtn).not.toBeDisabled();

    await userEvent.click(downloadBtn);

    expect(mockQrDownload).toHaveBeenCalledWith("Monstera", mockPlant.qr);
  });

  it("does NOT render QR card when plant.qr is absent", () => {
    const plantWithoutQr: Plant = { ...mockPlant, qr: undefined };
    vi.mocked(usePlant).mockReturnValue({
      data: plantWithoutQr,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.queryByTestId("qr-card")).not.toBeInTheDocument();
  });

  it("renders placeholder image when plant.imageUrl is null", () => {
    const plantWithoutImage: Plant = { ...mockPlant, imageUrl: undefined };
    vi.mocked(usePlant).mockReturnValue({
      data: plantWithoutImage,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("plant-image")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Monstera" }),
    ).not.toBeInTheDocument();
  });

  it("renders actual image when plant.imageUrl exists", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    const img = screen.getByRole("img", { name: "Monstera" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("example.com");
  });

  it("renders species chip with sage variant", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("chip-species")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof usePlant>);

    const { container } = render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("redirects to plants list on error", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(mockRedirect).toHaveBeenCalledWith("/en/plants");
  });

  it("renders breadcrumb with list link", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    const breadcrumbLink = screen.getByRole("link", { name: "Inventory" });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute("href", "/en/plants");
  });

  it('renders action bar wrapper with data-testid="plant-action-bar"', () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("plant-action-bar")).toBeInTheDocument();
  });

  it("renders the care log and care schedule sections directly, without tab navigation", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(screen.getByTestId("care-log-section")).toBeInTheDocument();
    expect(screen.getByTestId("care-schedule-section")).toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("renders CareScheduleList with the plant id and dict", () => {
    vi.mocked(usePlant).mockReturnValue({
      data: mockPlant,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlant>);

    render(
      <PlantDetailScreen
        dict={dict}
        careLogDict={careLogDict}
        careScheduleDict={careScheduleDict}
        photosDict={photosDict}
        lang="en"
        spaceId="s1"
        plantId="p1"
      />,
    );

    expect(vi.mocked(CareScheduleList)).toHaveBeenCalledWith(
      expect.objectContaining({ plantId: "p1", dict: careScheduleDict }),
      undefined,
    );
  });
});
