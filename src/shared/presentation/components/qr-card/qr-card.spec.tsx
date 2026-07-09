import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QrCard } from "./qr-card";

describe("QrCard", () => {
  it("renders the QR image, code, label and hint", () => {
    render(
      <QrCard
        image="base64data"
        code="qr1"
        label="Label · QR"
        hint="Print and stick on the pot"
        downloadLabel="Download image"
        onDownload={vi.fn()}
      />,
    );

    expect(screen.getByTestId("qr-image")).toHaveAttribute(
      "src",
      "data:image/png;base64,base64data",
    );
    expect(screen.getByTestId("qr-code")).toHaveTextContent("qr1");
    expect(screen.getByText("Label · QR")).toBeInTheDocument();
    expect(screen.getByText("Print and stick on the pot")).toBeInTheDocument();
  });

  it("calls onDownload when the download button is clicked", () => {
    const onDownload = vi.fn();
    render(
      <QrCard
        image="base64data"
        code="qr1"
        label="Label · QR"
        hint="Print and stick on the pot"
        downloadLabel="Download image"
        onDownload={onDownload}
      />,
    );

    fireEvent.click(screen.getByTestId("qr-download-btn"));

    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});
