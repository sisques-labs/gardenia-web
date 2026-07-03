import type { PlantingSpotStatus } from "@/core/planting-spots/domain/types/planting-spot-status.type";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlantingSpotStatusBadge } from "./planting-spot-status-badge";

const statusLabels: Record<PlantingSpotStatus, string> = {
  ACTIVE: "Active",
  FALLOW: "Fallow",
};

describe("PlantingSpotStatusBadge", () => {
  it("renders localized label for ACTIVE", () => {
    render(<PlantingSpotStatusBadge status="ACTIVE" dict={statusLabels} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders localized label for FALLOW", () => {
    render(<PlantingSpotStatusBadge status="FALLOW" dict={statusLabels} />);
    expect(screen.getByText("Fallow")).toBeInTheDocument();
  });
});
