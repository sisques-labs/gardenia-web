# Spec: planting-spot-qr

## Requirements

### R-1 — QR display on planting spot detail

The planting spot detail screen MUST render a QR card (image, code, label,
hint) whenever `spot.qr` is present, in the same visual style as the plant
detail page's QR card.

### R-2 — Download entry point

The QR card MUST expose an enabled download button that saves the QR image
as `{spotName}-qr.png` using the shared `useQrDownload` hook — no additional
network request (the image is already loaded as base64 on the spot).

### R-3 — Shared implementation across modules

`useQrDownload` and the QR card UI MUST live in `shared/presentation` and be
reused, unchanged in behavior, by both `plants` and `planting-spots` — no
per-module duplication of the download logic or card markup.

### R-4 — No QR card when absent

A planting spot with no `qr` MUST NOT render the QR card at all.

### R-5 — i18n parity

The QR label/hint/download copy MUST exist in both `en.ts` and `es.ts` under
`planting-spots.detail.qr`, and MUST pass `i18n-parity.test.ts`.

## Acceptance Scenarios

**S-1**: User opens a planting spot with a QR code assigned → sees a QR card
with a "Download image" button, enabled.

**S-2**: User clicks "Download image" → the browser downloads a `.png` file
named `{spotName}-qr.png` containing the same QR code shown on the page.

**S-3**: A planting spot with no `qr` assigned → the QR card is not rendered
at all.

**S-4**: The plant detail page's QR card continues to work exactly as before
— regression check on the shared extraction (same testids, same download
behavior).
