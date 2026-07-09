# Spec: qr-code-download

## Requirements

### R-1 — Download entry point on the plant detail screen

The plant detail screen's QR card MUST expose an enabled download action (`qr-download-btn`)
below the QR image, whenever `plant.qr` is present.

### R-2 — Downloading produces a PNG file

Clicking the download button MUST save the QR code already rendered on the page as a PNG image
file to the user's device, with no additional network request — the image is already loaded as
base64 on the plant.

### R-3 — Reuses existing QR data

The download MUST use `plant.qr.image` as-is; it MUST NOT call a new query/mutation or
regenerate the QR code.

### R-4 — Blob-based download for cross-browser reliability

The download MUST be implemented via `Blob` + `URL.createObjectURL` + an anchor's `download`
attribute (not a raw `data:` URI), for more reliable behavior across mobile browsers.

### R-5 — i18n parity

The button label MUST accurately describe the downloaded file type (PNG image, not PDF) in both
`en.ts` and `es.ts`, and MUST pass `i18n-parity.test.ts`.

## Acceptance Scenarios

**S-1**: User opens a plant with a QR code assigned → sees a "Download image" button under the
QR, enabled (not disabled).

**S-2**: User clicks "Download image" → the browser downloads a `.png` file named
`{plantName}-qr.png` containing the same QR code shown on the page.

**S-3**: A plant with no `qr` assigned → the whole QR card, including the download button, is
not rendered — unchanged from before this change.
