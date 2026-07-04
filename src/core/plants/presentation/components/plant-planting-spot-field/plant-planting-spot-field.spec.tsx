import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMutate = vi.fn();

vi.mock("@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook", () => ({
  usePlantingSpots: vi.fn(() => ({
    spots: [
      { id: "spot-1", name: "Bancal norte" },
      { id: "spot-2", name: "Bancal sur" },
    ],
    isLoading: false,
  })),
}));

vi.mock("@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook", () => ({
  useUpdatePlant: vi.fn(() => ({ mutate: mockMutate, isError: false })),
}));

import { useUpdatePlant } from "@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook";
import { PlantPlantingSpotField } from "./plant-planting-spot-field";

const dict = {
  label: "Planting spot",
  unassigned: "Unassigned",
  placeholder: "Select a planting spot",
  updateError: "Could not update the planting spot. Try again.",
};

describe("PlantPlantingSpotField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current spot name as the select value", () => {
    render(<PlantPlantingSpotField plantId="p1" currentSpotId="spot-1" dict={dict} />);

    expect(screen.getByTestId("plant-planting-spot-select")).toHaveTextContent("Bancal norte");
  });

  it("shows the unassigned option when the plant has no spot", () => {
    render(<PlantPlantingSpotField plantId="p1" dict={dict} />);

    expect(screen.getByTestId("plant-planting-spot-select")).toHaveTextContent("Unassigned");
  });

  it("calls useUpdatePlant().mutate with the new spot id when a different option is chosen", async () => {
    const user = userEvent.setup();
    render(<PlantPlantingSpotField plantId="p1" currentSpotId="spot-1" dict={dict} />);

    await user.click(screen.getByTestId("plant-planting-spot-select"));
    await user.click(screen.getByText("Bancal sur"));

    expect(mockMutate).toHaveBeenCalledWith({ id: "p1", plantingSpotId: "spot-2" });
  });

  it("calls useUpdatePlant().mutate with null when unassigned is chosen", async () => {
    const user = userEvent.setup();
    render(<PlantPlantingSpotField plantId="p1" currentSpotId="spot-1" dict={dict} />);

    await user.click(screen.getByTestId("plant-planting-spot-select"));
    await user.click(screen.getByText("Unassigned"));

    expect(mockMutate).toHaveBeenCalledWith({ id: "p1", plantingSpotId: null });
  });

  it("renders an error alert when the update fails", () => {
    vi.mocked(useUpdatePlant).mockReturnValue({ mutate: mockMutate, isError: true } as unknown as ReturnType<typeof useUpdatePlant>);

    render(<PlantPlantingSpotField plantId="p1" currentSpotId="spot-1" dict={dict} />);

    expect(screen.getByText("Could not update the planting spot. Try again.")).toBeInTheDocument();
  });
});
