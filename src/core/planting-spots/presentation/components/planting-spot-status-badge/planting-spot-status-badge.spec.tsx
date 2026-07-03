import type { PlantingSpotStatus } from "@/core/planting-spots/domain/types/planting-spot-status.type";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlantingSpotStatusBadge } from "./planting-spot-status-badge";

const statusLabels: Record<PlantingSpotStatus, string> = {
  ACTIVE: "Active",
  FALLOW: "Fallow",
};

describe("PlantingSpotStatusBadge", () => {
  it("renders localized label for ACTIVE with the forest variant", () => {
    render(<PlantingSpotStatusBadge status="ACTIVE" dict={statusLabels} />);
    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("forest");
  });

  it("renders localized label for FALLOW with the honey variant", () => {
    render(<PlantingSpotStatusBadge status="FALLOW" dict={statusLabels} />);
    const badge = screen.getByText("Fallow");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("honey");
  });
});
