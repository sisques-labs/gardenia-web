# Tasks: qr-code-download

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated lines | ~80 lines |
| 400-line budget risk | Low |
| Chained PRs | No (single PR) |
| Delivery strategy | ship directly |

## Phase 1 — Shared util

- [x] T-1 — `downloadBase64Image(base64Data, fileName)` util
  (`src/shared/presentation/utils/download-base64-image.util.ts`): decodes base64 into a
  `Uint8Array`, wraps it in a `Blob` (`image/png`), creates an object URL, triggers an anchor
  click with the given file name, then revokes the object URL.
- [x] T-2 — `download-base64-image.util.spec.ts`: asserts a PNG `Blob` is passed to
  `URL.createObjectURL`, the anchor's `href`/`download` are set before `.click()`, and the
  object URL is revoked afterwards.

## Phase 2 — Screen wiring

- [x] T-3 — Enable `qr-download-btn` in `plant-detail.screen.tsx` (removed `disabled`), added a
  `Download` icon, wired `onClick={handleQrDownload}` calling the util with `plant.qr.image`
  and `` `${plant.name}-qr.png` ``.
- [x] T-4 — `plant-detail.screen.spec.tsx`: new test asserting the button is enabled and
  clicking it calls `downloadBase64Image` with the plant's QR data and expected file name.

## Phase 3 — i18n

- [x] T-5 — Fixed `plants.detail.qr.download` copy in `en.ts`/`es.ts` from "Download
  PDF"/"Descargar PDF" to "Download image"/"Descargar imagen"; `i18n-parity.test.ts` passes
  unchanged (same keys, corrected values).

## Phase 4 — Verify & ship

- [x] T-6 — `pnpm test` (1397 tests), `pnpm lint`, `pnpm tsc --noEmit` — all green.
- [x] T-7 — PR opened against `develop` (#281).
