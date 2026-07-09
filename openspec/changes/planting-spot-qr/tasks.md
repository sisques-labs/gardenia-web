# Tasks: planting-spot-qr

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated lines | ~243 lines |
| 400-line budget risk | Low |
| Chained PRs | No (single PR) |
| Delivery strategy | ship directly |

## Phase 1 — Extract shared QR download hook + card

- [x] T-1 — Move `useQrDownload` from `core/plants/presentation/hooks/` to
  `shared/presentation/hooks/use-qr-download/`, generalized to accept a
  minimal `{ image: string }` shape instead of the plant-specific `PlantQr`
  type.
- [x] T-2 — Create `shared/presentation/components/qr-card/qr-card.tsx`
  (`QrCard`), extracted from `plant-detail.screen.tsx`'s inline QR card
  markup, with generic `qr-card` / `qr-image` / `qr-code` /
  `qr-download-btn` testids (previously `plant-qr-card`).
- [x] T-3 — Co-located specs for both (`use-qr-download.hook.spec.ts`,
  `qr-card.spec.tsx`).

## Phase 2 — Refactor plant-detail to use the shared version

- [x] T-4 — `plant-detail.screen.tsx` now imports `useQrDownload` / `QrCard`
  from `shared/presentation`, dropping the inline card markup and the
  now-unused `Download` icon import.
- [x] T-5 — Updated `plant-detail.screen.spec.tsx` mock path (`@/core/plants/
  presentation/hooks/use-qr-download/...` → `@/shared/presentation/hooks/
  use-qr-download/...`) and testids (`plant-qr-card` → `qr-card`).

## Phase 3 — Planting spot domain/GraphQL

- [x] T-6 — Added `PlantingSpotQr` interface and `qr?: PlantingSpotQr` to
  `PlantingSpot` in `domain/interfaces/planting-spot.interface.ts`.
- [x] T-7 — Added `qr { id spaceId targetUrl generation image createdAt
  updatedAt }` to `planting-spot-find-by-id.query.ts`.

## Phase 4 — Screen wiring + i18n

- [x] T-8 — `planting-spot-detail.screen.tsx` renders `QrCard` below the
  header when `spot.qr` is present, wired to `useQrDownload().download(spot
  .name, spot.qr)`.
- [x] T-9 — Added `qr.{label,hint,download}` under `detail` in
  `planting-spots/presentation/i18n/{en,es}.ts`.
- [x] T-10 — New tests in `planting-spot-detail.screen.spec.tsx` (renders QR
  card, downloads on click, hidden when absent); fixture `dict` objects
  updated across the other spec files in the module that construct the full
  dict inline (`planting-spot-card.spec.tsx`, `planting-spot-form.screen
  .spec.tsx`, `planting-spots-list.screen.spec.tsx`).

## Phase 5 — Verify & ship

- [x] T-11 — `pnpm test` (280/280 files, 1404/1404 tests), `pnpm lint`,
  `pnpm tsc --noEmit` — all green.
- [x] T-12 — PR opened against `develop` (gardenia-web#286), depends on the
  API-side change in gardenia-api#325.
