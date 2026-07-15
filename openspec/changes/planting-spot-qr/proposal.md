# Proposal: planting-spot-qr

## Intent

GDN-44: mirror the plant QR flow (`qr-code-download`, GDN-40) for planting
spots — the planting spot detail page should display its QR code and let the
user download it as a PNG, the same way the plant detail page already does.

## Scope

- `gardenia-web`, `planting-spots` bounded context (presentation + domain
  interface + GraphQL query only — depends on the API-side change in
  `gardenia-api`'s `planting-spot-qr` OpenSpec change / PR #325, which adds
  the `qr` field to `plantingSpotFindById`).
- Extracted `useQrDownload` and the QR "printable pot tag" card UI out of the
  `plants` module into `shared/presentation` (hook + `QrCard` component),
  since the same interaction is now needed by a second module —
  `plant-detail.screen.tsx` is refactored to consume the shared version too.
- Added `PlantingSpotQr` to the `PlantingSpot` domain interface and a `qr {
  ... }` selection to the `planting-spot-find-by-id` GraphQL query.
- `planting-spot-detail.screen.tsx` renders the shared `QrCard` (image, code,
  download button) whenever `spot.qr` is present, right below the header.
- New i18n copy (`en`/`es`) under `planting-spots.detail.qr.{label,hint,
  download}`.

## Out of Scope

- Any change to how the QR is generated (API concern, tracked in
  `gardenia-api`'s own `planting-spot-qr` change).
- Bulk download of QR codes for multiple planting spots.
- Printing directly from the app.

## Rollback

Purely additive: revert the extraction commit to restore the pre-change
`plants`-only `useQrDownload` hook and inline QR card markup, and drop the
`qr` field from the query/domain interface + the screen's rendering. No
existing functionality changes, since `plant-detail.screen.tsx`'s behavior is
preserved 1:1 by the shared extraction (same testids' semantics, same
markup, same hook signature).
