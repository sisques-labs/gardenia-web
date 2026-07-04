import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockMutate = vi.fn();

vi.mock("@/core/spaces/infrastructure/store/spaces.store", () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: "space-1" }),
  ),
}));

vi.mock("@/core/plants/presentation/hooks/use-plants/use-plants.hook", () => ({
  usePlants: vi.fn(() => ({
    data: [
      { id: "plant-1", name: "Tomato", plantingSpotId: "spot-other", userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" },
      { id: "plant-2", name: "Basil", userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" },
      { id: "plant-3", name: "Already here", plantingSpotId: "spot-1", userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" },
    ],
  })),
}));

vi.mock("@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook", () => ({
  useUpdatePlant: vi.fn(() => ({ mutate: mockMutate, isPending: false, isError: false })),
}));

// Real Radix Select relies on pointer/focus-trap behaviour that jsdom doesn't
// fully emulate, which can hang test runs. Stand in with a native <select>.
vi.mock("@/shared/presentation/components/ui/select/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: ReactNode }) => (
    <select data-testid="add-plant-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>,
}));

import { useUpdatePlant } from "@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook";
import { AddPlantToSpotModal } from "./add-plant-to-spot-modal";

const dict = {
  title: "Add plant",
  selectLabel: "Plant",
  selectPlaceholder: "Select a plant",
  noPlantsAvailable: "No plants available",
  submit: "Add",
  submitting: "Adding…",
  cancel: "Cancel",
  error: "Could not add the plant. Try again.",
};

describe("AddPlantToSpotModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with an opaque dialog surface", () => {
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("excludes plants already assigned to this spot from the options", () => {
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText("Tomato")).toBeInTheDocument();
    expect(screen.getByText("Basil")).toBeInTheDocument();
    expect(screen.queryByText("Already here")).not.toBeInTheDocument();
  });

  it("calls useUpdatePlant().mutate with the selected plant id and spotId on submit", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockMutate.mockImplementation((_input, opts) => opts?.onSuccess?.());
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={onClose} />);

    fireEvent.change(screen.getByTestId("add-plant-select"), { target: { value: "plant-2" } });
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(mockMutate).toHaveBeenCalledWith(
      { id: "plant-2", plantingSpotId: "spot-1" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call mutate when submitting without selecting a plant", async () => {
    const user = userEvent.setup();
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the no-plants-available message when every plant is already in this spot", async () => {
    const { usePlants } = await import("@/core/plants/presentation/hooks/use-plants/use-plants.hook");
    vi.mocked(usePlants).mockReturnValueOnce({
      data: [{ id: "plant-3", name: "Already here", plantingSpotId: "spot-1", userId: "u1", spaceId: "space-1", createdAt: "", updatedAt: "" }],
    } as unknown as ReturnType<typeof usePlants>);

    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText("No plants available")).toBeInTheDocument();
    expect(screen.queryByTestId("add-plant-select")).not.toBeInTheDocument();
  });

  it("renders an error message when the update fails", () => {
    vi.mocked(useUpdatePlant).mockReturnValue({ mutate: mockMutate, isPending: false, isError: true } as unknown as ReturnType<typeof useUpdatePlant>);
    render(<AddPlantToSpotModal spotId="spot-1" dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText("Could not add the plant. Try again.")).toBeInTheDocument();
  });
});
