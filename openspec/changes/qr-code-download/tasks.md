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

## Phase 2 — Presentation hook

- [x] T-3 — `useQrDownload()` hook
  (`src/core/plants/presentation/hooks/use-qr-download/use-qr-download.hook.ts`): exposes
  `download(plantName, qr)`, guards on a missing `qr`, delegates to `downloadBase64Image`.
  Extracted out of `plant-detail.screen.tsx` per review feedback — the screen should not call
  the shared util directly.
- [x] T-4 — `use-qr-download.hook.spec.ts`: asserts the util is called with the QR's `image`
  and `` `${plantName}-qr.png` ``, and that it's a no-op when `qr` is undefined.

## Phase 3 — Screen wiring

- [x] T-5 — Enable `qr-download-btn` in `plant-detail.screen.tsx` (removed `disabled`), added a
  `Download` icon, wired `onClick` to `useQrDownload().download(plant.name, plant.qr)`.
- [x] T-6 — `plant-detail.screen.spec.tsx`: new test asserting the button is enabled and
  clicking it calls the `useQrDownload` hook's `download` with the plant's name and QR.

## Phase 4 — i18n

- [x] T-7 — Fixed `plants.detail.qr.download` copy in `en.ts`/`es.ts` from "Download
  PDF"/"Descargar PDF" to "Download image"/"Descargar imagen"; `i18n-parity.test.ts` passes
  unchanged (same keys, corrected values).

## Phase 5 — Verify & ship

- [x] T-8 — `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` — all green.
- [x] T-9 — PR opened against `develop` (#281).
